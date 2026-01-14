import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getwallethardlimit = async (req, res) => {
    try {
        const existinghardlimit = await prisma.walletHardLimit.findFirst();

        if (!existinghardlimit) {
            return res.status(200).json({
                hardlimit: null,
                message: "Wallet hard limit not set"
            });
        }

        return res.status(200).json({
            hardlimit: existinghardlimit.hardlimit
        });

    } catch (error) {
        logging("wallet_hard_limit_error", error.message, "getwallethardlimit.js");
        return res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
};

export default getwallethardlimit;
