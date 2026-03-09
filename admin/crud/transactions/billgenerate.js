import logging from "../../../logging/logging_generate.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "userbilling");

const generateSinglePDF = async (data, filename) => {
    const filepath = path.join(UPLOADS_DIR, filename);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filepath);
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

    return new Promise((resolve, reject) => {
        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
    });
};

const generatebill = async (userid, sessionid) => {
    try {
        await fs.ensureDir(UPLOADS_DIR);

        const [userdetails, walletdetails, transactionhistoryList, charingsession] = await Promise.all([
            prisma.user.findFirstOrThrow({ where: { uid: userid } }),
            prisma.wallet.findFirstOrThrow({ where: { appuserrelatedwallet: userid } }),
            prisma.transactionHistory.findMany({ 
                where: { userid: userid }, 
                orderBy: { createdAt: 'desc' }
            }),
            prisma.charingsessions.findFirstOrThrow({
                where: {
                    userid: userid,
                    sessionid: sessionid
                },
                select: {
                    sessionid: true,
                    chargerid: true,
                    userid: true,
                    startime: true,
                    stoptime: true,
                    meterstart: true,
                    meterstop: true,
                    consumedkwh: true,
                    totalcost: true
                }
            })
        ]);

        const paymentId = `charge_${sessionid}`;

        const relatedTransaction = transactionhistoryList.find(
            (tx) => tx.paymentid === paymentId
        );

        if (!relatedTransaction) {
            logging(
                "info",
                `No matching transaction found for user ${userid} and session ${sessionid}`,
                "billgenerate.js"
            );
            return 0;
        }

        const start = new Date(charingsession.startime);
        const stop = new Date(charingsession.stoptime);
        const durationMs = stop - start;

        const billingId = crypto.randomUUID();
        const filename = `bill_${userid}_${charingsession.sessionid}_${Date.now()}.pdf`;

        const billingdata = {
            uid: billingId,
            userid: userid,
            username: userdetails.username,
            walletid: walletdetails.uid,
            lasttransaction: relatedTransaction.price,
            balancededuct: charingsession.totalcost,
            energyconsumption: charingsession.consumedkwh,
            chargerid: charingsession.chargerid,
            chargingtime: durationMs.toString(),
            associatedadminid: userdetails.associatedadminid,
            taxableamount: relatedTransaction.taxableamount,
            gstamount: relatedTransaction.gstdeductedamount || relatedTransaction.gst,
            totalamount: relatedTransaction.price,
        };

        const pdfPath = await generateSinglePDF(billingdata, filename);

        await prisma.userBilling.create({
            data: {
                ...billingdata,
                billingpdf: path.join("uploads", "userbilling", filename)
            }
        });

        logging("info", `Billing and PDFs generated for sessions of user ${userid}`, "billgenerate.js");
        return 1;

    } catch (err) {
        logging("error", `Billing generation failed: ${err.message}`, "billgenerate.js");
        return 3;
    }
};

export default generatebill;
