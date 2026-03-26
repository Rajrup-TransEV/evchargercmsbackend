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

const parseDateBoundary = (value, boundary) => {
    if (!value) return null;

    const isDateOnly =
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

    const parsedDate = isDateOnly
        ? new Date(
              boundary === "start"
                  ? `${value}T00:00:00.000+05:30`
                  : `${value}T23:59:59.999+05:30`
          )
        : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(
            `Invalid ${boundary === "start" ? "fromDate" : "toDate"}`
        );
    }

    return parsedDate;
};

const sanitizePositiveInt = (value, fallback, max = 100) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }

    return Math.min(parsed, max);
};

const getbilldata = async (req, res) => {
    try {
        const {
            userid,
            sortOrder = "desc",
            fromDate,
            toDate,
            chargerid,
            page = 1,
            limit = 10,
            demo,
        } = req.body;

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

        if (!userid) {
            return res.status(400).json({
                message: "userid is required",
            });
        }

        const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";
        const pageNumber = sanitizePositiveInt(page, 1);
        const pageSize = sanitizePositiveInt(limit, 10, 100);

        const parsedFromDate = parseDateBoundary(fromDate, "start");
        const parsedToDate = parseDateBoundary(toDate, "end");

        if (parsedFromDate && parsedToDate && parsedFromDate > parsedToDate) {
            return res.status(400).json({
                message: "fromDate cannot be greater than toDate",
            });
        }

        const where = {
            userid: userid,
        };

        if (chargerid) {
            where.chargerid = chargerid;
        }

        if (parsedFromDate || parsedToDate) {
            where.createdAt = {};
            if (parsedFromDate) where.createdAt.gte = parsedFromDate;
            if (parsedToDate) where.createdAt.lte = parsedToDate;
        }

        const skip = (pageNumber - 1) * pageSize;

        const [totalRecords, bills] = await prisma.$transaction([
            prisma.userBilling.count({ where }),
            prisma.userBilling.findMany({
                where,
                orderBy: {
                    createdAt: normalizedSortOrder,
                },
                skip,
                take: pageSize,
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
            }),
        ]);

        const totalPages =
            totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageSize);

        return res.status(200).json({
            message: "Bill data fetched successfully",
            pagination: {
                totalRecords,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
            },
            filters: {
                userid,
                chargerid: chargerid || null,
                fromDate: fromDate || null,
                toDate: toDate || null,
                sortOrder: normalizedSortOrder,
            },
            data: bills,
        });
    } catch (error) {
        logging("error", `Error in getbilldata: ${error.message}`, "getbilldata.js");
        return res.status(500).json({
            error: error.message,
        });
    }
};

export default getbilldata;