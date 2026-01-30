import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import generateCustomRandomUID from "../../../lib/customuids.js";

const prisma = new PrismaClient();

const rechargewallet = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];

  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "init_wallet_recharge.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { userEmail, price, adminId } = req.body;

  if (!userEmail || price == null || !adminId) {
    logging("error", "Fields cannot be empty", "init_wallet_recharge.js");
    return res.status(400).json({ message: "Fields cannot be empty" });
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    logging("error", "Price must be a valid number > 0", "init_wallet_recharge.js");
    return res.status(400).json({ message: "Price must be greater than zero" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Find user under this admin
      const user = await tx.user.findFirst({
        where: {
          AND: [{ email: userEmail }, { associatedadminid: adminId }],
        },
        select: { uid: true, username: true, email: true },
      });

      if (!user) {
        return { ok: false, status: 404, body: { message: "No user data found for the given email/admin." } };
      }

      // 2) Load wallet (include balance)
      const wallet = await tx.wallet.findFirst({
        where: { appuserrelatedwallet: user.uid },
        select: { uid: true, balance: true },
      });

      if (!wallet) {
        return { ok: false, status: 404, body: { message: "Error: No wallet data found" } };
      }

      // 3) Get last recharge history to increment numberofrecharge
      const lastRecharge = await tx.walletreachargehistory.findFirst({
        where: { userassociatedid: user.uid },
        orderBy: { createdAt: "desc" }, // IMPORTANT: requires createdAt field. If you don't have it, see note below.
        select: { numberofrecharge: true },
      });

      const prevCount = lastRecharge?.numberofrecharge ? Number(lastRecharge.numberofrecharge) : 0;
      const nextCount = Number.isFinite(prevCount) ? prevCount + 1 : 1;

      // 4) Compute new balance (string balance -> number -> string)
      const prevBalanceNum = wallet.balance == null ? 0 : Number(wallet.balance);
      const safePrevBalance = Number.isFinite(prevBalanceNum) ? prevBalanceNum : 0;

      const newBalanceNum = safePrevBalance + priceNum;

      // 5) Update wallet
      await tx.wallet.update({
        where: { uid: wallet.uid },
        data: {
          balance: newBalanceNum.toString(),
          iswalletrechargedone: true,
          recharger_made_by_which_user: adminId,
        },
      });

      // 6) Insert recharge history (store both previous and new)
      const history = await tx.walletreachargehistory.create({
        data: {
          uid: generateCustomRandomUID(),
          userassociatedid: user.uid,
          previousbalance: safePrevBalance.toString(),
          balanceleft: newBalanceNum.toString(),
          addedbalance: priceNum.toString(),
          numberofrecharge: nextCount.toString(),
        },
      });

      return {
        ok: true,
        status: 201,
        body: {
          message: "Wallet recharge initiated",
          actualprice: priceNum,
          previousBalance: safePrevBalance,
          newBalance: newBalanceNum,
          numberofrecharge: nextCount,
          historyUid: history.uid,
        },
      };
    });

    if (!result.ok) {
      logging("error", result.body.message, "init_wallet_recharge.js");
      return res.status(result.status).json(result.body);
    }

    logging("success", "Wallet recharge initiated", "init_wallet_recharge.js");
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    logging("error", `Recharge failed - ${error.message}`, "init_wallet_recharge.js");
    return res.status(500).json({
      message: "An error occurred while recharging the wallet",
      error: error.message,
    });
  }
};

export default rechargewallet;
