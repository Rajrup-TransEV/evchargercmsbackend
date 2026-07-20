import { PrismaClient } from "@prisma/client";
import generateCustomRandomUID from "../../../lib/customuids.js";
import logging from "../../../logging/logging_generate.js";

const prisma = new PrismaClient();

const verifyPayment = async (req, res) => {
  const apiauthkey = req.headers.apiauthkey;
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "verifypayment.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { razorpay_payment_id, userid, walletid, chargeruid, price } = req.body;
  if (!razorpay_payment_id) {
    return res.status(400).json({ message: "Missing payment ID" });
  }
  if (!userid || !walletid) {
    return res.status(400).json({ message: "Missing userid or walletid" });
  }
  const priceNumber = Number(price);
  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    return res.status(400).json({ message: "Price must be greater than zero" });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const wallets = await tx.$queryRaw`
          SELECT id, uid, balance, appuserrelatedwallet, userprofilerelatedwallet
          FROM wallet
          WHERE uid = ${String(walletid)}
          FOR UPDATE
        `;
        if (wallets.length !== 1) {
          return { status: 404, body: { message: "Error: No wallet data found" } };
        }
        const wallet = wallets[0];
        if (
          wallet.appuserrelatedwallet !== String(userid) &&
          wallet.userprofilerelatedwallet !== String(userid)
        ) {
          return { status: 403, body: { message: "Wallet does not belong to this user" } };
        }

        const existing = await tx.transactionsdetails.findUnique({
          where: { paymentid: String(razorpay_payment_id) },
        });
        if (existing) {
          if (
            existing.userid !== String(userid) ||
            existing.walletid !== String(walletid) ||
            Number(existing.price) !== priceNumber
          ) {
            return {
              status: 409,
              body: { message: "Payment ID is already assigned to another recharge" },
            };
          }
          return {
            status: 200,
            body: {
              message: "Wallet recharge already processed",
              actualprice: price,
              transactionDetails: existing,
              already_processed: true,
            },
          };
        }

        const currentBalance = Number(wallet.balance ?? 0);
        if (!Number.isFinite(currentBalance)) {
          throw new Error("Wallet balance is invalid");
        }
        const newBalance = currentBalance + priceNumber;
        const lastRecharge = await tx.walletreachargehistory.findFirst({
          where: { userassociatedid: String(userid) },
          orderBy: { createdAt: "desc" },
        });
        const previousCount = Number(lastRecharge?.numberofrecharge || 0);

        await tx.wallet.update({
          where: { uid: String(walletid) },
          data: {
            balance: newBalance.toFixed(2),
            iswalletrechargedone: true,
            recharger_made_by_which_user: String(userid),
          },
        });
        await tx.walletreachargehistory.create({
          data: {
            uid: generateCustomRandomUID(),
            userassociatedid: String(userid),
            previousbalance: currentBalance.toFixed(2),
            balanceleft: newBalance.toFixed(2),
            addedbalance: priceNumber.toFixed(2),
            numberofrecharge: String(
              Number.isFinite(previousCount) ? previousCount + 1 : 1
            ),
          },
        });
        const transactionDetails = await tx.transactionsdetails.create({
          data: {
            uid: generateCustomRandomUID(),
            paymentid: String(razorpay_payment_id),
            userid: String(userid),
            price: priceNumber.toFixed(2),
            chargeruid: chargeruid == null ? null : String(chargeruid),
            walletid: String(walletid),
          },
        });

        return {
          status: 201,
          body: {
            message: "Wallet recharge done",
            actualprice: price,
            transactionDetails,
          },
        };
      },
      { isolationLevel: "ReadCommitted", maxWait: 10_000, timeout: 20_000 }
    );

    logging("success", JSON.stringify(result.body), "verifypayment.js");
    return res.status(result.status).json(result.body);
  } catch (error) {
    if (error?.code === "P2002") {
      const existing = await prisma.transactionsdetails.findUnique({
        where: { paymentid: String(razorpay_payment_id) },
      });
      if (existing) {
        return res.status(200).json({
          message: "Wallet recharge already processed",
          actualprice: price,
          transactionDetails: existing,
          already_processed: true,
        });
      }
    }
    console.error(error);
    logging("error", error.message || String(error), "verifypayment.js");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default verifyPayment;
