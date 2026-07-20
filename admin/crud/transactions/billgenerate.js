import logging from "../../../logging/logging_generate.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import PDFDocument from "pdfkit";
import { normalizeTransactionId } from "../../../lib/charging/transaction-core.js";

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "userbilling");

const generateSinglePDF = async (data, filepath) => {
  const temporaryPath = `${filepath}.${crypto.randomUUID()}.tmp`;
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(temporaryPath);
  doc.pipe(stream);

  doc.fontSize(18).text("Customer Bill", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Billing ID: ${data.uid}`);
  doc.text(`User ID: ${data.userid}`);
  doc.text(`Username: ${data.username}`);
  doc.text(`Wallet ID: ${data.walletid}`);
  doc.text(`Energy Consumed: ${data.energyconsumption} kWh`);
  doc.text(`Charger ID: ${data.chargerid}`);
  doc.text(`Charging Duration (ms): ${data.chargingtime}`);
  doc.moveDown();
  doc.fontSize(14).text("Amount Breakdown");
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Taxable Amount: ₹${data.taxableamount}`);
  doc.text(`GST Amount: ₹${data.gstamount}`);
  doc.text(`Total Amount: ₹${data.totalamount}`);
  doc.text(`Deducted Amount: ₹${data.balancededuct}`);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });
  await fs.move(temporaryPath, filepath, { overwrite: true });
};

const generatebill = async (userid, sessionid) => {
  const normalizedSessionId = normalizeTransactionId(sessionid);
  try {
    await fs.ensureDir(UPLOADS_DIR);

    const existing = await prisma.userBilling.findFirst({
      where: {
        OR: [
          { sessionid: normalizedSessionId },
          {
            userid: String(userid),
            sessionid: null,
            billingpdf: { contains: `_${normalizedSessionId}_` },
          },
        ],
      },
    });
    if (existing) {
      if (!existing.sessionid) {
        await prisma.userBilling.update({
          where: { id: existing.id },
          data: { sessionid: normalizedSessionId },
        });
      }
      return 1;
    }

    const [appUser, staffUser, charingsession, relatedTransaction] =
      await Promise.all([
        prisma.user.findFirst({ where: { uid: String(userid) } }),
        prisma.userProfile.findFirst({ where: { uid: String(userid) } }),
        prisma.charingsessions.findUnique({
          where: { sessionid: normalizedSessionId },
        }),
        prisma.transactionHistory.findUnique({
          where: { paymentid: `charge_${normalizedSessionId}` },
        }),
      ]);
    const userdetails = appUser || staffUser;
    if (!userdetails || !charingsession || !relatedTransaction) return 0;
    if (
      charingsession.userid !== String(userid) ||
      relatedTransaction.userid !== String(userid)
    ) {
      throw new Error("Billing inputs do not belong to the requested user");
    }

    const wallet = await prisma.wallet.findUnique({
      where: { uid: relatedTransaction.walletid },
    });
    if (!wallet) throw new Error("Billing wallet not found");

    const durationMs = Math.max(
      new Date(charingsession.stoptime).getTime() -
        new Date(charingsession.startime).getTime(),
      0
    );
    const filename = `bill_${String(userid)}_${normalizedSessionId}.pdf`;
    const billingdata = {
      uid: crypto.randomUUID(),
      userid: String(userid),
      username: userdetails.username || userdetails.firstname || "Customer",
      walletid: wallet.uid,
      lasttransaction: relatedTransaction.price,
      balancededuct: charingsession.totalcost,
      energyconsumption: charingsession.consumedkwh,
      chargerid: charingsession.chargerid,
      chargingtime: Number.isFinite(durationMs) ? String(durationMs) : "0",
      associatedadminid: userdetails.associatedadminid,
      taxableamount: relatedTransaction.taxableamount,
      gstamount: relatedTransaction.gstdeductedamount || relatedTransaction.gst,
      totalamount: relatedTransaction.price,
    };

    await generateSinglePDF(billingdata, path.join(UPLOADS_DIR, filename));
    try {
      await prisma.userBilling.create({
        data: {
          ...billingdata,
          sessionid: normalizedSessionId,
          billingpdf: path.join("uploads", "userbilling", filename),
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
    }

    logging(
      "info",
      `Billing generated for user ${userid}, transaction ${normalizedSessionId}`,
      "billgenerate.js"
    );
    return 1;
  } catch (err) {
    logging("error", `Billing generation failed: ${err.message}`, "billgenerate.js");
    return 3;
  }
};

export default generatebill;
