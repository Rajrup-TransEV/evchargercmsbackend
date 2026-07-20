import jwt from "jsonwebtoken";

function bearerToken(req) {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export function resolveTransactionUser(req, requestedUserid) {
  const requested = String(requestedUserid || "").trim();
  if (!requested) {
    return { ok: false, status: 400, message: "Missing userid" };
  }

  const token = bearerToken(req);
  if (token) {
    try {
      const actor = jwt.verify(token, process.env.JWT_SECRET);
      const actorUserid = String(actor?.userid || "").trim();
      if (!actorUserid || actorUserid !== requested) {
        return { ok: false, status: 403, message: "Transaction does not belong to the authenticated user" };
      }
      return { ok: true, userid: actorUserid, source: "bearer" };
    } catch {
      return { ok: false, status: 401, message: "Invalid or expired bearer token" };
    }
  }

  const allowLegacy =
    String(process.env.ALLOW_LEGACY_TRANSACTION_IDENTITY ?? "true").toLowerCase() === "true";
  if (!allowLegacy) {
    return { ok: false, status: 401, message: "Bearer token required" };
  }

  return { ok: true, userid: requested, source: "legacy_body" };
}
