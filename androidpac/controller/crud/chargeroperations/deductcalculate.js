import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const deductcalculate = async (req, res) => {
  const {
    sessionid,
    chargerid,
    starttime,
    userid,
    stoptime,
    meterstart,
    meterstop,
    consumedkwh,
  } = req.body;

  try {
    // 1. Validate Charger
    const findcharger = await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: chargerid },
    });
    console.log(findcharger)
    // 2. Validate Hub
    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { has: chargerid },
      },
    });

    // 3. Fetch Tariff & Minimum Balance
    const hubtariff = findhub.hubtariff;
    const minimumbalance = await prisma.minimumbalance.findFirst();
    if (!minimumbalance) {
      return res.status(404).json({ message: "No minimum balance found" });
    }

    // 4. Get User Wallet
    const userdata = userid;
    const walletdetails = await prisma.wallet.findFirstOrThrow({
      where: {
        OR: [
          { appuserrelatedwallet: userdata },
          { userprofilerelatedwallet: userdata },
        ],
      },
      select: { balance: true, uid: true },
    });

    // 5. Calculate kWh consumed (fallback to consumedkwh if provided)
    const kwhConsumed =
      consumedkwh ?? (parseFloat(meterstop) - parseFloat(meterstart)) / 1000;

    if (isNaN(kwhConsumed) || kwhConsumed <= 0) {
      return res.status(400).json({ message: "Invalid kWh consumption" });
    }

    // 6. Compute cost
    const totalCost = kwhConsumed * hubtariff;

    // 7. Check wallet balance
    if (walletdetails.balance < totalCost) {
      return res
        .status(400)
        .json({ message: "Wallet balance is not sufficient. Please recharge." });
    }

    // 8. Deduct balance from wallet
    await prisma.wallet.update({
      where: { uid: walletdetails.uid },
      data: {
        balance: {
          decrement: totalCost,
        },
      },
    });

    // 9. Log charging session (optional)
    await prisma.charingsessions.create({
      data: {
        sessionid,
        chargerid,
        userid: userdata,
        starttime: new Date(starttime),
        stoptime: new Date(stoptime),
        meterstart: parseFloat(meterstart),
        meterstop: parseFloat(meterstop),
        consumedkwh: kwhConsumed,
        cost: totalCost,
      },
    });

    logging.info(`Charging session ${sessionid} stopped. Cost: ₹${totalCost}`);

    return res.status(200).json({
      message: "Charging session completed successfully",
      consumed: kwhConsumed,
      cost: totalCost,
      remainingBalance: walletdetails.balance - totalCost,
    });
  } catch (error) {
    logging.error("Error in chargerstop: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default deductcalculate;
