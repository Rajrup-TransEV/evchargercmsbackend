import { PrismaClient } from "@prisma/client";
import logging from "../../../../logging/logging_generate.js";
import dotenv from "dotenv";
import generatebill from "../../../../admin/crud/transactions/billgenerate.js";
dotenv.config();


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
  const ASSOCIATED_ADMIN = process.env.ASSOCIATED_ADMIN;
  try {
    // 1. Validate Charger
    if (!chargerid) {
      return res.status(400).json({ message: "Missing chargerid in request body" });
    }
    
    const findcharger = await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: chargerid },
    });

    // 2. Validate Hub
    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { array_contains: [chargerid] },
      },
    });

    // 3. Fetch Tariff & Minimum Balance
    const hubtariff = findhub.hubtariff;
    const minimumbalance = await prisma.minimumbalance.findFirst();
    if (!minimumbalance) {
      return res.status(404).json({ message: "No minimum balance found" });
    }

    // 4. Get User Wallet
    const walletdetails = await prisma.wallet.findFirstOrThrow({
      where: {
        OR: [
          { appuserrelatedwallet: userid },
          { userprofilerelatedwallet: userid },
        ],
      },
      select: { balance: true, uid: true },
    });

    // 5. Calculate kWh consumed
    const kwhConsumed =
      consumedkwh ?? (parseFloat(meterstop) - parseFloat(meterstart)) / 1000;

    if (isNaN(kwhConsumed) || kwhConsumed <= 0) {
      return res.status(400).json({ message: "Invalid kWh consumption" });
    }

    // 6. Compute cost
    const totalCost = kwhConsumed * hubtariff;

    const currentBalance = parseFloat(walletdetails.balance || "0");

    // // 7. Check balance
    // if (currentBalance < totalCost) {
    //   return res
    //     .status(400)
    //     .json({ message: "Wallet balance is not sufficient. Please recharge." });
    // }

    const updatedBalance = (currentBalance - totalCost).toFixed(2);

    // 8. Update wallet balance
    await prisma.wallet.update({
      where: { uid: walletdetails.uid },
      data: {
        balance: updatedBalance.toString(),
      },
    });

    // 9. Log charging session
    await prisma.charingsessions.create({
      data: {
        uid: crypto.randomUUID(),
        sessionid,
        chargerid,
        userid,
        startime: starttime,
        stoptime: stoptime,
        meterstart: meterstart,
        meterstop: meterstop,
        consumedkwh: kwhConsumed,
        totalcost: totalCost.toString(),
        associatedadminid: ASSOCIATED_ADMIN,
      },
    });

    // 10. Add transaction history entry
    await prisma.transactionHistory.create({
      data: {
        uid: crypto.randomUUID(),
        paymentid: `charge_${sessionid}`,
        walletid: walletdetails.uid,
        userid: userid,
        price: totalCost.toString(),
      },
    });

    console.log(`Charging session ${sessionid} stopped. Cost: ₹${totalCost}`);
    const billResult = await generatebill(userid);
    if (billResult == 1) {
      logging("info", `Billing generated for user ${userid}`, "billgenerate.js");
    }else if(billResult == 0){
      logging("info", `Billing not generated for user ${userid}`, "billgenerate.js");
    }else{
      logging("info", `Billing generation failed for user ${userid}`, "billgenerate.js");
    }
    
    return res.status(200).json({
      message: "Charging session completed successfully",
      consumed: kwhConsumed,
      cost: totalCost,
      remainingBalance: parseFloat(updatedBalance),
    });
  } catch (error) {
    console.log("Error in chargerstop: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default deductcalculate;
