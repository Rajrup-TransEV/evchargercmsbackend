import { PrismaClient } from "@prisma/client";
import fs from "fs/promises"; // fs.promises API
import path from "path";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getallthebills = async (req, res) => {
    try {
        const allbills = await prisma.userBilling.findMany();

        const billsWithPDF = await Promise.all(allbills.map(async (bill) => {
            try {
                const pdfFullPath = path.join(process.cwd(), bill.billingpdf);
                const pdfBuffer = await fs.readFile(pdfFullPath);
                const base64pdf = pdfBuffer.toString("base64");

                return {
                    ...bill,
                    pdfBase64: base64pdf,
                };
            } catch (err) {
                logging("error", `Failed to read PDF for billing ID ${bill.uid}: ${err.message}`, "getallthebills.js");
                return {
                    ...bill,
                    pdfBase64: null, // Still return the bill even if PDF is missing
                    error: `PDF missing or unreadable: ${err.message}`
                };
            }
        }));

        return res.status(200).json(billsWithPDF);

    } catch (error) {
        logging("error", `Error in getallthebills: ${error.message}`, "getallthebills.js");
        return res.status(500).json({ error: error.message });
    }
};

export default getallthebills;
