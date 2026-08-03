import { Prisma, PrismaClient } from "@prisma/client";
import { resolveAuthenticatedUser } from "../../../../lib/charging/request-identity.js";

const prisma = new PrismaClient();

const HISTORY_TYPES = new Set(["all", "wallet_recharge", "charging_debit"]);
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function positiveInteger(value, fallback, maximum, field) {
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value).trim();
  if (!/^[1-9]\d*$/.test(normalized)) {
    throw new TypeError(`${field} must be a positive integer`);
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new RangeError(`${field} must be between 1 and ${maximum}`);
  }
  return parsed;
}

export function parseMoneyHistoryQuery(query = {}) {
  const page = positiveInteger(query.page, 1, 1_000_000, "page");
  const limit = positiveInteger(query.limit, DEFAULT_LIMIT, MAX_LIMIT, "limit");
  const type = String(query.type || "all").trim().toLowerCase();

  if (!HISTORY_TYPES.has(type)) {
    throw new TypeError(
      "type must be one of all, wallet_recharge, or charging_debit"
    );
  }

  return { page, limit, type, offset: (page - 1) * limit };
}

function chargingDebitSQL(userid) {
  return Prisma.sql`
    SELECT
      th.id AS source_id,
      th.uid AS public_id,
      'CHARGING_DEBIT' AS entry_type,
      'DEBIT' AS direction,
      th.price AS amount,
      th.paymentid AS payment_id,
      th.walletid AS wallet_id,
      th.userid AS user_id,
      NULL AS charger_id,
      th.taxableamount AS taxable_amount,
      COALESCE(th.gstdeductedamount, th.gst) AS gst_amount,
      th.associatedadminid AS associated_admin_id,
      th.createdAt AS created_at,
      th.updatedAt AS updated_at
    FROM TransactionHistory th
    WHERE th.userid = ${userid}`;
}

function walletRechargeSQL(userid) {
  return Prisma.sql`
    SELECT
      td.id AS source_id,
      td.uid AS public_id,
      'WALLET_RECHARGE' AS entry_type,
      'CREDIT' AS direction,
      td.price AS amount,
      td.paymentid AS payment_id,
      td.walletid AS wallet_id,
      td.userid AS user_id,
      td.chargeruid AS charger_id,
      NULL AS taxable_amount,
      NULL AS gst_amount,
      td.associatedadminid AS associated_admin_id,
      td.createdAt AS created_at,
      td.updatedAt AS updated_at
    FROM Transactionsdetails td
    WHERE td.userid = ${userid}`;
}

function ledgerSQL(userid, type) {
  if (type === "wallet_recharge") return walletRechargeSQL(userid);
  if (type === "charging_debit") return chargingDebitSQL(userid);
  return Prisma.sql`${chargingDebitSQL(userid)} UNION ALL ${walletRechargeSQL(userid)}`;
}

function sessionIDFromPaymentID(paymentID) {
  const value = String(paymentID || "");
  return value.startsWith("charge_") ? value.slice("charge_".length) : null;
}

function mapChargingSession(session) {
  if (!session) return null;
  return {
    session_id: session.sessionid,
    charger_id: session.chargerid,
    started_at: session.startime,
    stopped_at: session.stoptime,
    meter_start_wh: session.meterstart,
    meter_stop_wh: session.meterstop,
    consumed_kwh: session.consumedkwh,
    total_cost: session.totalcost,
  };
}

function displayName(profile) {
  if (!profile) return null;
  const name = [profile.firstname, profile.lastname].filter(Boolean).join(" ").trim();
  return name || null;
}

function mapBill({ bill, row, session, customer, issuer, charger }) {
  if (row.entry_type !== "CHARGING_DEBIT") return null;

  const sessionID = sessionIDFromPaymentID(row.payment_id);
  const billID = bill?.uid || bill?.id || null;

  return {
    id: billID,
    source: bill ? "USER_BILLING" : "DERIVED_FROM_TRANSACTION",
    title: "Customer Bill",
    invoice_number: billID || row.payment_id,
    issued_at: bill?.createdAt || row.created_at,
    updated_at: bill?.updatedAt || row.updated_at,
    currency: "INR",
    customer: {
      id: customer?.uid || bill?.userid || row.user_id || null,
      name: bill?.username || customer?.username || null,
      email: customer?.email || null,
      phone: customer?.phonenumber || null,
      address: null,
    },
    issuer: issuer
      ? {
          id: issuer.uid,
          name: displayName(issuer),
          email: issuer.email,
          phone: issuer.phonenumber,
          address: issuer.address,
          designation: issuer.designation,
          gstin: null,
        }
      : null,
    charger: {
      id: charger?.uid || session?.chargerid || bill?.chargerid || null,
      name: charger?.ChargerName || null,
      serial_number: charger?.Chargerserialnum || null,
      address: charger?.full_address || null,
      connector_type: charger?.Connector_type || null,
      protocol: charger?.protocol || null,
    },
    charging: {
      session_id: bill?.sessionid || session?.sessionid || sessionID,
      started_at: session?.startime || null,
      stopped_at: session?.stoptime || null,
      duration_ms: bill?.chargingtime || null,
      meter_start_wh: session?.meterstart || null,
      meter_stop_wh: session?.meterstop || null,
      energy_consumed_kwh:
        bill?.energyconsumption || session?.consumedkwh || null,
    },
    payment: {
      reference: row.payment_id,
      wallet_id: bill?.walletid || row.wallet_id,
    },
    amounts: {
      taxable: bill?.taxableamount || row.taxable_amount,
      gst: bill?.gstamount || row.gst_amount,
      total: bill?.totalamount || row.amount,
      balance_deducted: bill?.balancededuct || row.amount,
      last_transaction: bill?.lasttransaction || row.amount,
    },
  };
}

async function countEntries(db, userid, type) {
  const [chargingDebits, walletRecharges] = await Promise.all([
    type === "wallet_recharge"
      ? Promise.resolve(0)
      : db.transactionHistory.count({ where: { userid } }),
    type === "charging_debit"
      ? Promise.resolve(0)
      : db.transactionsdetails.count({ where: { userid } }),
  ]);

  return chargingDebits + walletRecharges;
}

async function loadChargingDetails(db, userid, rows) {
  const sessionIDs = [
    ...new Set(
      rows
        .filter((row) => row.entry_type === "CHARGING_DEBIT")
        .map((row) => sessionIDFromPaymentID(row.payment_id))
        .filter(Boolean)
    ),
  ];

  if (sessionIDs.length === 0) {
    return {
      sessionsByID: new Map(),
      billsBySessionID: new Map(),
      issuersByID: new Map(),
      chargersByID: new Map(),
    };
  }

  const [sessions, bills] = await Promise.all([
    db.charingsessions.findMany({
      where: { userid, sessionid: { in: sessionIDs } },
      select: {
        sessionid: true,
        chargerid: true,
        startime: true,
        stoptime: true,
        meterstart: true,
        meterstop: true,
        consumedkwh: true,
        totalcost: true,
        associatedadminid: true,
      },
    }),
    db.userBilling.findMany({
      where: { userid, sessionid: { in: sessionIDs } },
      select: {
        id: true,
        uid: true,
        userid: true,
        chargerid: true,
        username: true,
        walletid: true,
        lasttransaction: true,
        balancededuct: true,
        energyconsumption: true,
        chargingtime: true,
        sessionid: true,
        taxableamount: true,
        gstamount: true,
        totalamount: true,
        associatedadminid: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const issuerIDs = [
    ...new Set(
      [
        ...sessions.map((value) => value.associatedadminid),
        ...bills.map((value) => value.associatedadminid),
        ...rows.map((value) => value.associated_admin_id),
      ].filter(Boolean)
    ),
  ];
  const chargerIDs = [
    ...new Set(
      [
        ...sessions.map((value) => value.chargerid),
        ...bills.map((value) => value.chargerid),
        ...rows.map((value) => value.charger_id),
      ].filter(Boolean)
    ),
  ];

  const [issuers, chargers] = await Promise.all([
    issuerIDs.length === 0
      ? Promise.resolve([])
      : db.userProfile.findMany({
          where: { uid: { in: issuerIDs } },
          select: {
            uid: true,
            firstname: true,
            lastname: true,
            email: true,
            phonenumber: true,
            address: true,
            designation: true,
          },
        }),
    chargerIDs.length === 0
      ? Promise.resolve([])
      : db.charger_Unit.findMany({
          where: { uid: { in: chargerIDs } },
          select: {
            uid: true,
            ChargerName: true,
            Chargerserialnum: true,
            full_address: true,
            Connector_type: true,
            protocol: true,
          },
        }),
  ]);

  return {
    sessionsByID: new Map(sessions.map((session) => [session.sessionid, session])),
    billsBySessionID: new Map(bills.map((bill) => [bill.sessionid, bill])),
    issuersByID: new Map(issuers.map((issuer) => [issuer.uid, issuer])),
    chargersByID: new Map(chargers.map((charger) => [charger.uid, charger])),
  };
}

export function createMoneyTransactionHistoryHandler(db = prisma) {
  return async function getMoneyTransactionHistory(req, res) {
    const identity = resolveAuthenticatedUser(req);
    if (!identity.ok) {
      return res.status(identity.status).json({ message: identity.message });
    }

    let pagination;
    try {
      pagination = parseMoneyHistoryQuery(req.query);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const { page, limit, type, offset } = pagination;

    try {
      const [rows, total, wallet, customer] = await Promise.all([
        db.$queryRaw(
          Prisma.sql`
            SELECT *
            FROM (${ledgerSQL(identity.userid, type)}) AS money_ledger
            ORDER BY created_at DESC, entry_type DESC, source_id DESC
            LIMIT ${limit} OFFSET ${offset}`
        ),
        countEntries(db, identity.userid, type),
        db.wallet.findFirst({
          where: { appuserrelatedwallet: identity.userid },
          select: { uid: true, balance: true },
        }),
        db.user.findFirst({
          where: { uid: identity.userid },
          select: {
            uid: true,
            username: true,
            email: true,
            phonenumber: true,
          },
        }),
      ]);

      const {
        sessionsByID,
        billsBySessionID,
        issuersByID,
        chargersByID,
      } = await loadChargingDetails(db, identity.userid, rows);

      const data = rows.map((row) => {
        const sessionID = sessionIDFromPaymentID(row.payment_id);
        const session = sessionsByID.get(sessionID);
        const bill = billsBySessionID.get(sessionID);
        const issuerID =
          bill?.associatedadminid ||
          session?.associatedadminid ||
          row.associated_admin_id;
        const chargerID = session?.chargerid || bill?.chargerid || row.charger_id;
        return {
          id: row.public_id || row.source_id,
          type: row.entry_type,
          direction: row.direction,
          amount: row.amount,
          currency: "INR",
          payment_id: row.payment_id,
          wallet_id: row.wallet_id,
          charger_id:
            row.charger_id || session?.chargerid || null,
          taxable_amount: row.taxable_amount,
          gst_amount: row.gst_amount,
          created_at: row.created_at,
          updated_at: row.updated_at,
          charging_session: mapChargingSession(session),
          bill: mapBill({
            bill,
            row,
            session,
            customer,
            issuer: issuersByID.get(issuerID),
            charger: chargersByID.get(chargerID),
          }),
        };
      });

      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
      return res.status(200).json({
        message: "Money transaction history fetched successfully",
        wallet: wallet
          ? { id: wallet.uid, current_balance: wallet.balance, currency: "INR" }
          : null,
        data,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_previous: page > 1,
          has_next: page < totalPages,
        },
        filter: { type },
      });
    } catch (error) {
      console.error("money transaction history error:", error);
      return res.status(500).json({
        message: "Failed to fetch money transaction history",
      });
    }
  };
}

export default createMoneyTransactionHistoryHandler();
