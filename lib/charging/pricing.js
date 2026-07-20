import { parseFiniteDecimal } from "./transaction-core.js";

const toPaise = (value, field) => {
  const paise = Math.round(
    parseFiniteDecimal(value, field, { minimum: 0 }) * 100
  );
  if (!Number.isSafeInteger(paise)) {
    throw new RangeError(`${field} exceeds the supported monetary range`);
  }
  return paise;
};

export function calculateChargingLimit({ balance, hardLimit, tariffPerKwh }) {
  const balancePaise = toPaise(balance, "wallet balance");
  const hardLimitPaise = toPaise(hardLimit, "wallet hard limit");
  const tariffPaise = toPaise(tariffPerKwh, "hub tariff");

  if (tariffPaise <= 0) {
    throw new TypeError("hub tariff must be greater than zero");
  }

  const usablePaise = Math.max(balancePaise - hardLimitPaise, 0);
  const hundredthsOfKwh = Math.floor((usablePaise * 100) / tariffPaise);

  return {
    balancePaise,
    hardLimitPaise,
    tariffPaise,
    usablePaise,
    maxKwh: hundredthsOfKwh / 100,
    maxKwhText: (hundredthsOfKwh / 100).toFixed(2),
  };
}

export function calculateChargingCost({ consumedKwh, tariffPerKwh, gstPercent }) {
  const kwh = parseFiniteDecimal(consumedKwh, "consumedkwh", { minimum: 0 });
  const tariffPaise = toPaise(tariffPerKwh, "hub tariff");
  const gst = parseFiniteDecimal(gstPercent ?? 0, "GST", { minimum: 0 });

  if (tariffPaise <= 0) {
    throw new TypeError("hub tariff must be greater than zero");
  }

  // hubtariff is the downstream-compatible, GST-inclusive price per kWh.
  const totalPaise = Math.round(kwh * tariffPaise);
  if (!Number.isSafeInteger(totalPaise)) {
    throw new RangeError("charging cost exceeds the supported monetary range");
  }
  const taxablePaise = Math.round(totalPaise / (1 + gst / 100));
  const gstPaise = totalPaise - taxablePaise;

  return {
    consumedKwh: kwh,
    totalPaise,
    taxablePaise,
    gstPaise,
    totalText: (totalPaise / 100).toFixed(2),
    taxableText: (taxablePaise / 100).toFixed(2),
    gstText: (gstPaise / 100).toFixed(2),
  };
}
