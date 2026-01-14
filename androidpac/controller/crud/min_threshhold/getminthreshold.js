import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const getminthreshold = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];

  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "getminthreshold.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  try {
    const existingBalance = await prisma.minimumbalance.findFirst();

    if (!existingBalance) {
      return res.status(200).json({ minbalance: null, message: "Minimum balance not set" });
    }

    return res.status(200).json({ minbalance: existingBalance.minbalance });
  } catch (error) {
    logging("error", `${error}`, "getminthreshold.js");
    return res.status(500).json({ error: error.message });
  }
};

export default getminthreshold
