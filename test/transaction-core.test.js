import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeConnectorId,
  normalizeTransactionId,
  retryDelayMs,
} from "../lib/charging/transaction-core.js";
import {
  calculateChargingCost,
  calculateChargingLimit,
} from "../lib/charging/pricing.js";

test("normalizes exact OCPP transaction IDs without coercion", () => {
  assert.equal(normalizeTransactionId(123), "123");
  assert.equal(normalizeTransactionId("000123"), "123");
  assert.equal(normalizeTransactionId("2147483647"), "2147483647");
});

test("rejects lossy, signed, fractional, and out-of-range transaction IDs", () => {
  for (const value of [
    Number.MAX_SAFE_INTEGER + 1,
    0,
    "0",
    -1,
    "-1",
    "+1",
    "1.0",
    "1e3",
    "2147483648",
    "",
  ]) {
    assert.throws(() => normalizeTransactionId(value));
  }
});

test("normalizes connector IDs", () => {
  assert.equal(normalizeConnectorId("01"), "1");
  assert.equal(normalizeConnectorId(2), "2");
  assert.throws(() => normalizeConnectorId("-1"));
  assert.throws(() => normalizeConnectorId("0"));
});

test("charging limit treats hub tariff as GST-inclusive and floors to 0.01 kWh", () => {
  assert.deepEqual(
    calculateChargingLimit({
      balance: "500.00",
      hardLimit: "50.00",
      tariffPerKwh: "18.00",
    }),
    {
      balancePaise: 50000,
      hardLimitPaise: 5000,
      tariffPaise: 1800,
      usablePaise: 45000,
      maxKwh: 25,
      maxKwhText: "25.00",
    }
  );

  const fractional = calculateChargingLimit({
    balance: "100.00",
    hardLimit: "50.00",
    tariffPerKwh: "18.00",
  });
  assert.equal(fractional.maxKwhText, "2.77");
  assert.ok(fractional.maxKwh * 18 <= 50);
});

test("completion pricing is paise-rounded and accepts zero-energy sessions", () => {
  assert.deepEqual(
    calculateChargingCost({
      consumedKwh: "1.25",
      tariffPerKwh: "18",
      gstPercent: "18",
    }),
    {
      consumedKwh: 1.25,
      totalPaise: 2250,
      taxablePaise: 1907,
      gstPaise: 343,
      totalText: "22.50",
      taxableText: "19.07",
      gstText: "3.43",
    }
  );
  assert.equal(
    calculateChargingCost({
      consumedKwh: 0,
      tariffPerKwh: 18,
      gstPercent: 18,
    }).totalText,
    "0.00"
  );
});

test("remote-stop retry delay is bounded", () => {
  assert.equal(retryDelayMs(1), 30_000);
  assert.equal(retryDelayMs(2), 60_000);
  assert.equal(retryDelayMs(100), 30 * 60_000);
});
