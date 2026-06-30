import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const prisma = new PrismaClient();

const checkstartresponse = async (req, res) => {
    const { transactionid, userid, chargerid, connectorid } = req.body;
    
    try {
        // 1. Fetch GST and Wallet Hard Limit
        const gstRecord = await prisma.gstCreate.findFirst();
        const wallethardlimitRecord = await prisma.walletHardLimit.findFirst();

        const gstValue = parseFloat(gstRecord?.gst || "0"); // string → number
        const hardLimit = parseFloat(wallethardlimitRecord?.hardlimit || "0"); // string → number

        // 2. Fetch Hub Tariff (R)
        const findhub = await prisma.addhub.findFirstOrThrow({
            where: {
                hubchargers: { array_contains: [chargerid] },
            },
        });

        const tariffPerKwh = parseFloat(findhub?.hubtariff || "0"); // string → number

        // 3. Fetch Wallet Balance (X)
        const wallet = await prisma.wallet.findFirstOrThrow({
            where: {
                OR: [
                    { appuserrelatedwallet: userid },
                    { userprofilerelatedwallet: userid },
                ],
            },
            select: { balance: true },
        });

        const balance = parseFloat(wallet?.balance || "0"); // string → number

        // 4. Compute max kWh = (X - Y) / (R * (1 + Z/100))
        const denominator = tariffPerKwh * (1 + gstValue / 100);
        const usableBalance = Math.max(balance - hardLimit, 0); // protect from negative values
        const kwh = usableBalance / denominator;

        // 5. Save transaction
        const savedata = await prisma.chargerTransaction.create({
            data: {
                uid: crypto.randomUUID(),
                chargerid: chargerid,
                userid: userid,
                transactionid: transactionid,
                connectorid: connectorid,
                max_kwh: kwh.toFixed(2), // stored as string
            },
        });

        // 6. Respond
        return res.status(200).json({
            message: "Charging started",
            savedata: savedata,
            max_kwh: kwh.toFixed(2),
            gst: gstValue.toFixed(2),
            wallet_hard_limit: hardLimit.toFixed(2),
        });
    } catch (error) {
        logging("charger_status_error", error.message, "chargerbookings.js");
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

export default checkstartresponse;
