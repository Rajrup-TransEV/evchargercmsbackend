import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getbillbyuserid = async (req, res) => {
    try {
        const { userid } = req.body;

        const bills = await prisma.userBilling.findMany({
            where: {
                userid: userid
            }
        });

        if (bills.length === 0) {
            return res.status(404).json({ message: "No bills found for this user." });
        }

        const billsWithPDF = await Promise.all(
            bills.map(async (bill) => {
                try {
                    const pdfFullPath = path.join(process.cwd(), bill.billingpdf);
                    const pdfBuffer = await fs.readFile(pdfFullPath);
                    const base64pdf = pdfBuffer.toString("base64");

                    return {
                        ...bill,
                        pdfBase64: base64pdf
                    };
                } catch (err) {
                    logging("error", `PDF read error for bill ${bill.uid}: ${err.message}`, "getbillbyuserid.js");
                    return {
                        ...bill,
                        pdfBase64: null,
                        error: "PDF file not found or unreadable"
                    };
                }
            })
        );

        return res.status(200).json(billsWithPDF);

    } catch (error) {
        logging("error", `Error in getbillbyuserid: ${error.message}`, "getbillbyuserid.js");
        return res.status(500).json({ error: error.message });
    }
};

export default getbillbyuserid;
