//ocpp 2.0  implement
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const checktransaction = async (req, res) => {
  const { userid, chargerid } = req.body;

  try {
    // 1. Find charger
    const findcharger = await prisma.charger_Unit.findFirstOrThrow({
      where: { uid: chargerid },
      select: {
        uid: true,
        Chargerserialnum: true,
        userId: true,
      },
    });
    if (!findcharger) {
      return res.status(404).json({ message: "Charger not found" });
    }

    // 2. Find hub using charger ID
    const findhub = await prisma.addhub.findFirstOrThrow({
      where: {
        hubchargers: { has: chargerid },
      },
      select: { hubtariff: true },
    });
    if (!findhub) {
      return res.status(404).json({ message: "Hub not found" });
    }
    const tariffPerKwh = findhub.hubtariff;
    if (!tariffPerKwh || tariffPerKwh <= 0) {
      return res.status(400).json({ message: "Hub tariff is not set correctly" });
    }

    // 3. Fetch user wallet
    const walletdetails = await prisma.wallet.findFirstOrThrow({
      where: {
        OR: [
          { appuserrelatedwallet: userid },
          { userprofilerelatedwallet: userid },
        ],
      },
      select: { balance: true },
    });
    if (!walletdetails) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    const balance = walletdetails.balance;
    if (balance <= 0) {
      return res.status(400).json({ message: "Wallet balance is 0. Please recharge." });
    }

    // 4. Estimate kWh and charge %
    const estimatedKwh = balance / tariffPerKwh;
    const fullBatteryCapacityKwh = 30; // Static assumption
    const estimatedChargePercent = Math.min(100, (estimatedKwh / fullBatteryCapacityKwh) * 100).toFixed(2);

    return res.status(200).json({
      message: "Wallet balance is sufficient for charging.",
      walletBalance: `₹${balance}`,
      canChargeUpTo: `${estimatedChargePercent}%`,
      approxEnergyAvailable: `${estimatedKwh.toFixed(2)} kWh`,
      note: "This is an estimate based on your balance and hub's tariff.",
    });

  } catch (error) {
    console.error("checktransaction error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default checktransaction;
