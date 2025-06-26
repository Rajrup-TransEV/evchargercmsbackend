import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const Getbillbyadminid = async(req,res)=>{
    try {
        const {adminid} = req.body
        const bills = await prisma.userBilling.findMany({
            where: {
                adminid: adminid
            }
        });
        if(bills.length === 0){
            return res.status(404).json({message:"No bills found for this admin"})
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
                    logging("error", `PDF read error for bill ${bill.uid}: ${err.message}`, "getbillbyadminid.js");
                    return {
                        ...bill,
                        pdfBase64: null,
                        error: "PDF file not found or unreadable"
                    };
                }
            })
        );
        res.status(200).json({bills})
    } catch (error) {
        logging("error", `Error fetching bills for admin ${adminid}: ${error.message}`, "getbillbyadminid.js");
        res.status(500).json({ message: "Internal server error" });
    }
}


export default Getbillbyadminid