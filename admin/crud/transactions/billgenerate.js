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
    doc.text(`Last Transaction: ₹${data.lasttransaction}`);
    doc.text(`Deducted Amount: ₹${data.balancededuct}`);
    doc.text(`Energy Consumed: ${data.energyconsumption} kWh`);
    doc.text(`Charger ID: ${data.chargerid}`);
    doc.text(`Charging Duration (ms): ${data.chargingtime}`);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on("finish", () => resolve(filepath));
        stream.on("error", reject);
    });
};

const generatebill = async (userid) => {
    try {
        await fs.ensureDir(UPLOADS_DIR);

        const [userdetails, walletdetails, transactionhistoryList, charingsessions] = await Promise.all([
            prisma.user.findFirstOrThrow({ where: { uid: userid } }),
            prisma.wallet.findFirstOrThrow({ where: { appuserrelatedwallet: userid } }),
            prisma.transactionHistory.findMany({ 
                where: { userid: userid }, 
                orderBy: { createdAt: 'desc' }
            }),
            prisma.charingsessions.findMany({
                where: { userid: userid },
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

        if (charingsessions.length === 0) {
            logging("info", `No charging sessions found for user ${userid}`, "billgenerate.js");
            return 0;
        }

        const latestTransaction = transactionhistoryList[0];
        if (!latestTransaction) {
            logging("info", `No transaction history found for user ${userid}`, "billgenerate.js");
            return 0;
        }

        for (const session of charingsessions) {
            const start = new Date(session.startime);
            const stop = new Date(session.stoptime);
            const durationMs = stop - start;

            const billingId = crypto.randomUUID();
            const filename = `bill_${userid}_${session.sessionid}_${Date.now()}.pdf`;

            const billingdata = {
                uid: billingId,
                userid: userid,
                username: userdetails.username,
                walletid: walletdetails.uid,
                lasttransaction: latestTransaction.price,
                balancededuct: session.totalcost,
                energyconsumption: session.consumedkwh,
                chargerid: session.chargerid,
                chargingtime: durationMs.toString(),
                associatedadminid: userdetails.associatedadminid
            };

            const pdfPath = await generateSinglePDF(billingdata, filename);

            await prisma.userBilling.create({
                data: {
                    ...billingdata,
                    billingpdf: path.join("uploads", "userbilling", filename)
                }
            });
        }

        logging("info", `Billing and PDFs generated for ${charingsessions.length} sessions of user ${userid}`, "billgenerate.js");
        return 1;

    } catch (err) {
        logging("error", `Billing generation failed: ${err.message}`, "billgenerate.js");
        return 3;
    }
};

export default generatebill;
