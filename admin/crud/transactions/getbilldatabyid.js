import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getbilldatabyid = async (req, res) => {
    try {
        const { billid } = req.body;

        if (!billid) {
            return res.status(400).json({
                message: "billid is required",
            });
        }

        const bill = await prisma.userBilling.findFirstOrThrow({
            where: {
                uid: billid,
            },
            select: {
                id: true,
                uid: true,
                userid: true,
                chargerid: true,
                username: true,
                walletid: true,
                lasttransaction: true,
                balancededuct: true,
                energyconsumption: true,
                chargingtime: true,
                taxableamount: true,
                gstamount: true,
                totalamount: true,
                associatedadminid: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            message: "Bill data fetched successfully",
            data: bill,
        });
    } catch (error) {
        logging(
            "error",
            `Error in getbilldatabyid: ${error.message}`,
            "getbilldatabyid.js"
        );

        const statusCode = error.code === "P2025" ? 404 : 500;

        return res.status(statusCode).json({
            error:
                error.code === "P2025"
                    ? "Bill not found"
                    : error.message,
        });
    }
};

export default getbilldatabyid;