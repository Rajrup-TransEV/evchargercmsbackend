import {
  TRANSACTION_STATUS,
  normalizeTransactionId,
  retryDelayMs,
} from "./transaction-core.js";

function remoteStopPayload(transaction) {
  return {
    uid: transaction.chargerid,
    id_tag: transaction.userid,
    connector_id: transaction.connectorid,
    transaction_id: normalizeTransactionId(transaction.transactionid),
    max_kwh: transaction.max_kwh,
  };
}

async function responseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text.slice(0, 500) };
  }
}

export async function requestRemoteStop(prisma, transaction) {
  const now = new Date();
  const stoppableStatuses = [
    TRANSACTION_STATUS.ACTIVE,
    TRANSACTION_STATUS.UNKNOWN,
    TRANSACTION_STATUS.RECONCILE_REQUIRED,
    TRANSACTION_STATUS.STOP_REQUESTED,
    TRANSACTION_STATUS.STOP_RETRYING,
    TRANSACTION_STATUS.STOP_FAILED,
  ];
  const claimed = await prisma.chargerTransaction.updateMany({
    where: {
      id: transaction.id,
      status: { in: stoppableStatuses },
    },
    data: {
      status: TRANSACTION_STATUS.STOP_PROCESSING,
      stopattempts: { increment: 1 },
      laststopattemptat: now,
      laststoperror: null,
    },
  });

  if (claimed.count === 0) {
    const latest = await prisma.chargerTransaction.findUnique({
      where: { id: transaction.id },
    });
    if (latest?.status === TRANSACTION_STATUS.COMPLETED) {
      return { ok: true, completed: true, status: "completed" };
    }
    return {
      ok: true,
      inProgress: true,
      status: "processing",
      detail: "A stop attempt is already in progress",
    };
  }

  const current = await prisma.chargerTransaction.findUnique({
    where: { id: transaction.id },
  });
  const attempt = current?.stopattempts || transaction.stopattempts + 1;

  try {
    const response = await fetch(`${process.env.EXTERNAL_URI}/api/stop_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.OCPP_API_KEY,
      },
      body: JSON.stringify(remoteStopPayload(transaction)),
      signal: AbortSignal.timeout(
        Math.max(Number(process.env.OCPP_HTTP_TIMEOUT_MS) || 15_000, 1_000)
      ),
    });
    const result = await responseJson(response);
    const remoteStatus = String(result?.status || "").toLowerCase();
    const accepted =
      response.ok && (remoteStatus === "accepted" || remoteStatus === "success");
    const nextAttemptAt = new Date(Date.now() + retryDelayMs(attempt));

    await prisma.chargerTransaction.updateMany({
      where: {
        id: transaction.id,
        status: { not: TRANSACTION_STATUS.COMPLETED },
      },
      data: accepted
        ? {
            status: TRANSACTION_STATUS.STOP_REQUESTED,
            stoprequestedat: now,
            nextstopattemptat: nextAttemptAt,
            laststoperror: null,
          }
        : {
            status: TRANSACTION_STATUS.STOP_RETRYING,
            nextstopattemptat: nextAttemptAt,
            laststoperror:
              String(result?.detail || result?.message || `HTTP ${response.status}`).slice(0, 4000),
          },
    });

    return {
      ok: accepted,
      httpStatus: response.status,
      status: result?.status,
      detail: result?.detail,
      attempt,
    };
  } catch (error) {
    await prisma.chargerTransaction.updateMany({
      where: {
        id: transaction.id,
        status: { not: TRANSACTION_STATUS.COMPLETED },
      },
      data: {
        status: TRANSACTION_STATUS.STOP_RETRYING,
        nextstopattemptat: new Date(Date.now() + retryDelayMs(attempt)),
        laststoperror: String(error?.message || error).slice(0, 4000),
      },
    });
    return { ok: false, status: "error", detail: error.message, attempt };
  }
}
