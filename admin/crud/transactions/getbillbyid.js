import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getbillbyid = async (req, res) => {
    try {
        const { billid } = req.body; // Consider moving this to req.params or req.query

        const bill = await prisma.userBilling.findFirstOrThrow({
            where: { uid: billid }
        });

        const pdfFullPath = path.join(process.cwd(), bill.billingpdf);
        const pdfBuffer = await fs.readFile(pdfFullPath);
        const base64pdf = pdfBuffer.toString("base64");

        return res.status(200).json({
            ...bill,
            pdfBase64: base64pdf,
        });

    } catch (error) {
        logging("error", `Error in getbillbyid: ${error.message}`, "getbillbyid.js");

        const statusCode = error.code === "P2025" ? 404 : 500;
        return res.status(statusCode).json({ error: error.message });
    }
};

export default getbillbyid;
