import { parseFiniteDecimal } from "./transaction-core.js";

export async function loadChargingPolicy(prisma, { userid, chargerid }) {
  const [wallets, hubs, gstRecord, hardLimitRecord] = await Promise.all([
    prisma.wallet.findMany({
      where: {
        OR: [
          { appuserrelatedwallet: userid },
          { userprofilerelatedwallet: userid },
        ],
      },
      select: { uid: true, balance: true },
      take: 2,
    }),
    prisma.addhub.findMany({
      where: { hubchargers: { array_contains: [chargerid] } },
      select: { uid: true, hubtariff: true },
      take: 2,
    }),
    prisma.gstCreate.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.walletHardLimit.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);

  if (wallets.length !== 1) {
    throw new Error(
      wallets.length === 0
        ? "Wallet not found"
        : "Multiple wallets found for this user; reconciliation is required"
    );
  }
  if (hubs.length !== 1) {
    throw new Error(
      hubs.length === 0
        ? "Charger hub not found"
        : "Charger belongs to multiple hubs; reconciliation is required"
    );
  }

  const balance = parseFiniteDecimal(wallets[0].balance, "wallet balance");
  const gstPercent = parseFiniteDecimal(gstRecord?.gst ?? "0", "GST");
  const hardLimit = parseFiniteDecimal(
    hardLimitRecord?.hardlimit ?? "0",
    "wallet hard limit"
  );
  const tariffPerKwh = parseFiniteDecimal(hubs[0].hubtariff, "hub tariff");
  if (tariffPerKwh <= 0) {
    throw new TypeError("hub tariff must be greater than zero");
  }

  return {
    wallet: wallets[0],
    hub: hubs[0],
    balance,
    gstPercent,
    hardLimit,
    tariffPerKwh,
  };
}
