import test from "node:test";
import assert from "node:assert/strict";
import { requestRemoteStop } from "../lib/charging/remote-stop.js";
import { TRANSACTION_STATUS } from "../lib/charging/transaction-core.js";

function fakePrisma(transaction) {
  const updates = [];
  return {
    updates,
    chargerTransaction: {
      async updateMany(args) {
        updates.push(args);
        return { count: 1 };
      },
      async findUnique() {
        return { ...transaction, stopattempts: transaction.stopattempts + 1 };
      },
    },
  };
}

test("remote stop sends the exact CMS-compatible payload and records acceptance", async () => {
  const previousFetch = globalThis.fetch;
  const previousUri = process.env.EXTERNAL_URI;
  const previousKey = process.env.OCPP_API_KEY;
  const transaction = {
    id: "row-1",
    chargerid: "CP-1",
    userid: "passenger-1",
    connectorid: "1",
    transactionid: "123",
    max_kwh: "2.50",
    stopattempts: 0,
  };
  const prisma = fakePrisma(transaction);
  let request;
  process.env.EXTERNAL_URI = "http://ocpp-hal";
  process.env.OCPP_API_KEY = "test-key";
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ status: "Accepted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await requestRemoteStop(prisma, transaction);
    assert.equal(result.ok, true);
    assert.equal(request.url, "http://ocpp-hal/api/stop_transaction");
    assert.equal(request.options.headers["x-api-key"], "test-key");
    assert.deepEqual(JSON.parse(request.options.body), {
      uid: "CP-1",
      id_tag: "passenger-1",
      connector_id: "1",
      transaction_id: "123",
      max_kwh: "2.50",
    });
    assert.equal(
      prisma.updates.at(-1).data.status,
      TRANSACTION_STATUS.STOP_REQUESTED
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUri === undefined) delete process.env.EXTERNAL_URI;
    else process.env.EXTERNAL_URI = previousUri;
    if (previousKey === undefined) delete process.env.OCPP_API_KEY;
    else process.env.OCPP_API_KEY = previousKey;
  }
});

test("remote stop schedules a retry for a rejected command", async () => {
  const previousFetch = globalThis.fetch;
  const transaction = {
    id: "row-2",
    chargerid: "CP-2",
    userid: "passenger-2",
    connectorid: "1",
    transactionid: "456",
    max_kwh: "3.00",
    stopattempts: 0,
  };
  const prisma = fakePrisma(transaction);
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ status: "Rejected", detail: "busy" }), {
      status: 200,
    });

  try {
    const result = await requestRemoteStop(prisma, transaction);
    assert.equal(result.ok, false);
    assert.equal(result.detail, "busy");
    assert.equal(
      prisma.updates.at(-1).data.status,
      TRANSACTION_STATUS.STOP_RETRYING
    );
    assert.ok(prisma.updates.at(-1).data.nextstopattemptat instanceof Date);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
