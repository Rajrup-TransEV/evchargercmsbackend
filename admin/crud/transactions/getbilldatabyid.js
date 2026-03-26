import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const isDemoEnabled = (demo) => demo === true || demo === "true";

const demoBill = {
    id: "demo-db-row-id",
    uid: "DEMO_BILL_001",
    userid: "demo_user",
    chargerid: "demo_charger_001",
    username: "Demo User",
    walletid: "demo_wallet_001",
    lasttransaction: "demo_txn_001",
    balancededuct: "200.00",
    energyconsumption: "5.40",
    chargingtime: "01:20:00",
    taxableamount: "169.49",
    gstamount: "30.51",
    totalamount: "200.00",
    associatedadminid: "demo_admin_001",
    createdAt: new Date("2026-03-20T08:30:00.000Z"),
    updatedAt: new Date("2026-03-20T08:35:00.000Z"),
};

const getbilldatabyid = async (req, res) => {
    try {
        const { billid, demo } = req.body;

        if (isDemoEnabled(demo)) {
            return res.status(200).json({
                message: "Bill data fetched successfully",
                pagination: {
                    totalRecords: 1,
                    totalPages: 1,
                    currentPage: 1,
                    pageSize: 1,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
                filters: {
                    userid: userid || null,
                    chargerid: chargerid || null,
                    fromDate: fromDate || null,
                    toDate: toDate || null,
                    sortOrder: sortOrder === "asc" ? "asc" : "desc",
                    demo: true,
                },
                data: [demoBill],
            });
        }

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