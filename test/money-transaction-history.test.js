import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import {
  createMoneyTransactionHistoryHandler,
  parseMoneyHistoryQuery,
} from "../androidpac/controller/crud/transactions/getmoneytransactionhistory.js";

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("money history query validation applies safe defaults and limits", () => {
  assert.deepEqual(parseMoneyHistoryQuery({}), {
    page: 1,
    limit: 20,
    type: "all",
    offset: 0,
  });
  assert.deepEqual(
    parseMoneyHistoryQuery({ page: "2", limit: "10", type: "CHARGING_DEBIT" }),
    { page: 2, limit: 10, type: "charging_debit", offset: 10 }
  );
  assert.throws(() => parseMoneyHistoryQuery({ page: "0" }));
  assert.throws(() => parseMoneyHistoryQuery({ limit: "51" }));
  assert.throws(() => parseMoneyHistoryQuery({ type: "anything" }));
});

test("money history is bearer-scoped and enriches charging debits", async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-secret";

  const createdAt = new Date("2026-08-03T03:00:00.000Z");
  const queriedUserids = [];
  const db = {
    $queryRaw: async (query) => {
      assert.ok(query.values.includes("passenger-1"));
      return [
        {
          source_id: "row-charge",
          public_id: "charge-public",
          entry_type: "CHARGING_DEBIT",
          direction: "DEBIT",
          amount: "22.50",
          payment_id: "charge_9451203",
          wallet_id: "wallet-1",
          charger_id: null,
          taxable_amount: "19.07",
          gst_amount: "3.43",
          created_at: createdAt,
          updated_at: createdAt,
        },
        {
          source_id: "row-recharge",
          public_id: "recharge-public",
          entry_type: "WALLET_RECHARGE",
          direction: "CREDIT",
          amount: "500.00",
          payment_id: "pay_123",
          wallet_id: "wallet-1",
          charger_id: null,
          taxable_amount: null,
          gst_amount: null,
          created_at: createdAt,
          updated_at: createdAt,
        },
      ];
    },
    transactionHistory: {
      count: async ({ where }) => {
        queriedUserids.push(where.userid);
        return 1;
      },
    },
    transactionsdetails: {
      count: async ({ where }) => {
        queriedUserids.push(where.userid);
        return 1;
      },
    },
    wallet: {
      findFirst: async ({ where }) => {
        queriedUserids.push(where.appuserrelatedwallet);
        return { uid: "wallet-1", balance: "477.50" };
      },
    },
    user: {
      findFirst: async ({ where }) => {
        queriedUserids.push(where.uid);
        return {
          uid: "passenger-1",
          username: "Passenger One",
          email: "passenger@example.com",
          phonenumber: "9999999999",
        };
      },
    },
    charingsessions: {
      findMany: async ({ where }) => {
        queriedUserids.push(where.userid);
        assert.deepEqual(where.sessionid.in, ["9451203"]);
        return [
          {
            sessionid: "9451203",
            chargerid: "CP-001",
            startime: "2026-08-03T02:00:00Z",
            stoptime: "2026-08-03T03:00:00Z",
            meterstart: "1000",
            meterstop: "2250",
            consumedkwh: "1.25",
            totalcost: "22.50",
            associatedadminid: "admin-1",
          },
        ];
      },
    },
    userBilling: {
      findMany: async ({ where }) => {
        queriedUserids.push(where.userid);
        return [
          {
            id: "bill-row",
            uid: "bill-public",
            userid: "passenger-1",
            chargerid: "CP-001",
            username: "Passenger One",
            walletid: "wallet-1",
            lasttransaction: "22.50",
            balancededuct: "22.50",
            energyconsumption: "1.25",
            chargingtime: "3600000",
            sessionid: "9451203",
            taxableamount: "19.07",
            gstamount: "3.43",
            totalamount: "22.50",
            associatedadminid: "admin-1",
            createdAt,
            updatedAt: createdAt,
          },
        ];
      },
    },
    userProfile: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.uid.in, ["admin-1"]);
        return [
          {
            uid: "admin-1",
            firstname: "Charge",
            lastname: "Operator",
            email: "operator@example.com",
            phonenumber: "8888888888",
            address: "Operator address",
            designation: "Administrator",
          },
        ];
      },
    },
    charger_Unit: {
      findMany: async ({ where }) => {
        assert.deepEqual(where.uid.in, ["CP-001"]);
        return [
          {
            uid: "CP-001",
            ChargerName: "Main Charger",
            Chargerserialnum: "SERIAL-001",
            full_address: "Charging location",
            Connector_type: "CCS2",
            protocol: "OCPP",
          },
        ];
      },
    },
  };

  try {
    const token = jwt.sign({ userid: "passenger-1" }, process.env.JWT_SECRET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      query: { page: "1", limit: "20", type: "all" },
    };
    const res = responseRecorder();

    await createMoneyTransactionHistoryHandler(db)(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.data[0].type, "CHARGING_DEBIT");
    assert.equal(res.body.data[0].charging_session.session_id, "9451203");
    assert.equal(res.body.data[0].bill.id, "bill-public");
    assert.equal(res.body.data[0].bill.source, "USER_BILLING");
    assert.equal(res.body.data[0].bill.customer.email, "passenger@example.com");
    assert.equal(res.body.data[0].bill.issuer.name, "Charge Operator");
    assert.equal(res.body.data[0].bill.charger.name, "Main Charger");
    assert.equal(res.body.data[0].bill.charging.energy_consumed_kwh, "1.25");
    assert.equal(res.body.data[0].bill.amounts.total, "22.50");
    assert.equal("billing_pdf" in res.body.data[0].bill, false);
    assert.equal(res.body.data[1].type, "WALLET_RECHARGE");
    assert.equal(res.body.data[1].charging_session, null);
    assert.equal(res.body.data[1].bill, null);
    assert.deepEqual(new Set(queriedUserids), new Set(["passenger-1"]));
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test("money history rejects missing bearer auth before database access", async () => {
  const db = {
    $queryRaw: async () => assert.fail("database should not be called"),
  };
  const res = responseRecorder();

  await createMoneyTransactionHistoryHandler(db)({ headers: {}, query: {} }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Bearer token required");
});

test("charging debit includes derived PDF data before a UserBilling row exists", async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-secret";
  const createdAt = new Date("2026-08-03T03:00:00.000Z");
  const db = {
    $queryRaw: async () => [
      {
        source_id: "charge-row",
        public_id: "charge-public",
        entry_type: "CHARGING_DEBIT",
        direction: "DEBIT",
        amount: "10.00",
        payment_id: "charge_12345",
        wallet_id: "wallet-1",
        charger_id: null,
        taxable_amount: "8.47",
        gst_amount: "1.53",
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    transactionHistory: { count: async () => 1 },
    transactionsdetails: { count: async () => 0 },
    wallet: { findFirst: async () => null },
    user: {
      findFirst: async () => ({
        uid: "passenger-1",
        username: "Passenger One",
        email: "passenger@example.com",
        phonenumber: null,
      }),
    },
    charingsessions: { findMany: async () => [] },
    userBilling: { findMany: async () => [] },
  };

  try {
    const token = jwt.sign({ userid: "passenger-1" }, process.env.JWT_SECRET);
    const res = responseRecorder();
    await createMoneyTransactionHistoryHandler(db)(
      {
        headers: { authorization: `Bearer ${token}` },
        query: { type: "charging_debit" },
      },
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data[0].bill.source, "DERIVED_FROM_TRANSACTION");
    assert.equal(res.body.data[0].bill.invoice_number, "charge_12345");
    assert.equal(res.body.data[0].bill.charging.session_id, "12345");
    assert.equal(res.body.data[0].bill.amounts.total, "10.00");
    assert.equal(res.body.data[0].bill.customer.name, "Passenger One");
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
