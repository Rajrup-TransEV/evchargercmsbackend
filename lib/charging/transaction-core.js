export const TRANSACTION_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  STOP_PROCESSING: "STOP_PROCESSING",
  STOP_REQUESTED: "STOP_REQUESTED",
  STOP_RETRYING: "STOP_RETRYING",
  STOP_FAILED: "STOP_FAILED",
  COMPLETED: "COMPLETED",
  UNKNOWN: "UNKNOWN",
  RECONCILE_REQUIRED: "RECONCILE_REQUIRED",
});

export const CURRENT_TRANSACTION_STATUSES = Object.freeze([
  TRANSACTION_STATUS.ACTIVE,
  TRANSACTION_STATUS.STOP_PROCESSING,
  TRANSACTION_STATUS.STOP_REQUESTED,
  TRANSACTION_STATUS.STOP_RETRYING,
  TRANSACTION_STATUS.STOP_FAILED,
  TRANSACTION_STATUS.RECONCILE_REQUIRED,
]);

const MAX_TRANSACTION_ID = 2147483647n;

export function normalizeTransactionId(value) {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError("transactionid must be a positive safe integer or decimal string");
    }
    value = String(value);
  }

  if (typeof value !== "string") {
    throw new TypeError("transactionid must be an integer or decimal string");
  }

  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    throw new TypeError("transactionid must be an unsigned base-10 integer");
  }

  const parsed = BigInt(normalized);
  if (parsed <= 0n) {
    throw new RangeError("transactionid must be greater than zero");
  }
  if (parsed > MAX_TRANSACTION_ID) {
    throw new RangeError("transactionid exceeds the OCPP HAL signed 32-bit range");
  }

  return parsed.toString();
}

export function normalizeConnectorId(value) {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError("connectorid must be a positive safe integer");
    }
    return String(value);
  }

  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    throw new TypeError("connectorid must be a positive integer");
  }

  const parsed = BigInt(value.trim());
  if (parsed <= 0n || parsed > MAX_TRANSACTION_ID) {
    throw new RangeError("connectorid must be in the signed 32-bit positive range");
  }
  return parsed.toString();
}

export function parseFiniteDecimal(value, field, { minimum = 0 } = {}) {
  if (value === null || value === undefined || value === "") {
    throw new TypeError(`${field} is required`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum) {
    throw new TypeError(`${field} must be a finite number >= ${minimum}`);
  }

  return parsed;
}

export function retryDelayMs(attempt) {
  const safeAttempt = Math.max(Number(attempt) || 1, 1);
  return Math.min(30_000 * (2 ** (safeAttempt - 1)), 30 * 60_000);
}

export function isPrismaUniqueError(error) {
  return error?.code === "P2002";
}
