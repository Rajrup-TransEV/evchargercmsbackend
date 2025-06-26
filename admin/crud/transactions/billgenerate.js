import logging from "../../../logging/logging_generate.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
const prisma = new PrismaClient();

const generatebill = async (userid) => {
    try {
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

        const generatedBills = [];

        for (const session of charingsessions) {
            const start = new Date(session.startime);
            const stop = new Date(session.stoptime);
            const durationMs = stop - start;
            
            const billingdata = {
                uid: crypto.randomUUID(),
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

            const bill = await prisma.userBilling.create({ data: billingdata });
            generatedBills.push(bill);
        }

        logging("info", `Billing generated for ${generatedBills.length} sessions of user ${userid}`, "billgenerate.js");
        return 1;

    } catch (err) {
        logging("error", `Billing generation failed: ${err.message}`, "billgenerate.js");
        return 3;
    }
};

export default generatebill;
