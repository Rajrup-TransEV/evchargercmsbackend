import logging from "../../../logging/logging_generate.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

const generatebill = async (req, res) => {
    const apiauthkey = req.headers['apiauthkey'];

    if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
        logging("error", "API route access error", "billgenerate.js");
        return res.status(403).json({ message: "API route access forbidden" });
    }

    const { userid } = req.body;

    try {
        const [userdetails, walletdetails, transactionhistory, charingsessions] = await Promise.all([
            prisma.user.findFirstOrThrow({ where: { uid: userid } }),
            prisma.wallet.findFirstOrThrow({ where: { user: userid } }),
            prisma.transactionHistory.findFirstOrThrow({ where: { userid } }),
            prisma.charingsessions.findMany({
                where: { uid: userid },
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
            return res.status(404).json({ message: "No charging sessions found" });
        }

        const session = charingsessions[0]; // Taking the latest or first session for now

        // Calculate charging time (assuming both timestamps are Date objects or ISO strings)
        const start = new Date(session.startime);
        const stop = new Date(session.stoptime);
        const durationMs = stop - start;
        const billingdata = {
            uid: crypto.randomUUID(),
            userid: userid,
            username: userdetails.username,
            walletid: walletdetails.uid,
            lasttransaction: transactionhistory.price,
            balancededuct: session.totalcost,
            energyconsumption: session.consumedkwh,
            chargerid: session.chargerid,
            chargingtime: durationMs,
            associatedadminid: userdetails.associatedadminid
        };

        // Save to userbilling table
        await prisma.userBilling.create({ data: billingdata });

        logging("info", `Billing generated for user ${userid}`, "billgenerate.js");
        return res.status(200).json({ message: "Billing generated successfully", billing: billingdata });

    } catch (err) {
        logging("error", `Billing generation failed: ${err.message}`, "billgenerate.js");
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export default generatebill;
