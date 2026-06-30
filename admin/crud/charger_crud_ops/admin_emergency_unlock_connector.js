import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import logging from "../../../logging/logging_generate.js";

dotenv.config();

const prisma = new PrismaClient();

function cleanString(value) {
  return String(value ?? "").trim();
}

function normalizeRole(value) {
  return cleanString(value).toLowerCase().replace(/[\s-]+/g, "_");
}

function isSuperAdminRole(role) {
  const r = normalizeRole(role);
  return [
    "superadmin",
    "super_admin",
    "superuser",
    "super_user",
    "root",
  ].includes(r);
}

function isAdminRole(role) {
  const r = normalizeRole(role);
  return isSuperAdminRole(r) || r.includes("admin");
}

function asStringArrayFromJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((x) => String(x));
  return [];
}

function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const parts = String(auth).split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  return "";
}

async function getActor(req) {
  const token = getBearerToken(req);

  let tokenActor = {};
  if (token && process.env.JWT_SECRET) {
    try {
      tokenActor = jwt.verify(token, process.env.JWT_SECRET) || {};
    } catch (_) {
      // Do not hard-fail here because this codebase also uses body-provided admin ids.
      tokenActor = {};
    }
  }

  const adminid =
    cleanString(tokenActor.adminid) ||
    cleanString(req.body?.adminid) ||
    cleanString(req.body?.admin_id) ||
    cleanString(req.body?.uid);

  if (!adminid) return null;

  const profile = await prisma.userProfile.findFirst({
    where: { uid: adminid },
    select: {
      uid: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      associatedadminid: true,
    },
  });

  if (!profile) return null;

  return {
    uid: profile.uid,
    email: profile.email,
    name: [profile.firstname, profile.lastname].filter(Boolean).join(" "),
    role: profile.role || tokenActor.userType || "",
    associatedadminid: profile.associatedadminid,
  };
}

async function adminOwnsCharger(adminid, charger) {
  if (charger.associatedadminid && charger.associatedadminid === adminid) {
    return true;
  }

  // Some chargers are scoped through hubs instead of direct charger.associatedadminid.
  const hubs = await prisma.addhub.findMany({
    select: {
      uid: true,
      adminuid: true,
      associatedadminid: true,
      hubchargers: true,
    },
  });

  for (const hub of hubs) {
    const hubChargerIds = asStringArrayFromJson(hub.hubchargers);
    const hubBelongsToAdmin =
      hub.adminuid === adminid || hub.associatedadminid === adminid;

    if (hubBelongsToAdmin && hubChargerIds.includes(charger.uid)) {
      return true;
    }
  }

  return false;
}

const adminEmergencyUnlockConnector = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access forbidden", "admin_emergency_unlock_connector.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const chargerid =
    cleanString(req.body?.chargerid) ||
    cleanString(req.body?.charger_uid) ||
    cleanString(req.body?.uid);

  const connectoridRaw =
    req.body?.connectorid ??
    req.body?.connector_id ??
    req.body?.connector;

  const connectorid = Number.parseInt(connectoridRaw, 10);
  const reason = cleanString(req.body?.reason) || "Admin emergency unlock";

  try {
    if (!chargerid) {
      return res.status(400).json({ message: "Missing chargerid" });
    }

    if (!Number.isInteger(connectorid) || connectorid <= 0) {
      return res.status(400).json({ message: "Invalid connectorid" });
    }

    const actor = await getActor(req);
    if (!actor) {
      return res.status(401).json({ message: "Missing or invalid admin identity" });
    }

    if (!isAdminRole(actor.role)) {
      return res.status(403).json({
        message: "Only admin or superadmin can emergency unlock connectors",
        role: actor.role,
      });
    }

    const charger = await prisma.charger_Unit.findFirst({
      where: { uid: chargerid },
      select: {
        uid: true,
        ChargerName: true,
        number_of_connectors: true,
        chargeridentity: true,
        associatedadminid: true,
      },
    });

    if (!charger) {
      return res.status(404).json({ message: "Charger not found" });
    }

    const connectorCount = Number.parseInt(charger.number_of_connectors || "0", 10);
    if (Number.isInteger(connectorCount) && connectorCount > 0 && connectorid > connectorCount) {
      return res.status(400).json({
        message: "Connector does not exist on this charger",
        connectorid,
        number_of_connectors: connectorCount,
      });
    }

    const superadmin = isSuperAdminRole(actor.role);
    const authorized = superadmin || (await adminOwnsCharger(actor.uid, charger));

    if (!authorized) {
      logging(
        "warn",
        `Unauthorized emergency unlock attempt by ${actor.uid} on charger ${chargerid}`,
        "admin_emergency_unlock_connector.js"
      );

      return res.status(403).json({
        message: "Admin is not authorized to unlock this charger",
      });
    }

    if (!process.env.EXTERNAL_URI || !process.env.OCPP_API_KEY) {
      return res.status(500).json({
        message: "OCPP bridge configuration missing",
        required_env: ["EXTERNAL_URI", "OCPP_API_KEY"],
      });
    }

    const ocppResponse = await fetch(`${process.env.EXTERNAL_URI}/api/unlock_connector`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.OCPP_API_KEY,
      },
      body: JSON.stringify({
        uid: chargerid,
        connector_id: connectorid,
      }),
    });

    let ocppResult = {};
    try {
      ocppResult = await ocppResponse.json();
    } catch (_) {
      ocppResult = {};
    }

    const status = cleanString(ocppResult?.status);
    const statusLower = status.toLowerCase();

    logging(
      ocppResponse.ok && statusLower === "unlocked" ? "info" : "warn",
      `Emergency unlock by ${actor.uid} role=${actor.role} charger=${chargerid} connector=${connectorid} status=${status || "unknown"} reason=${reason}`,
      "admin_emergency_unlock_connector.js"
    );

    if (ocppResponse.ok && statusLower === "unlocked") {
      return res.status(200).json({
        message: "Emergency unlock requested successfully",
        unlock_request: {
          status,
          chargerid,
          connectorid,
        },
        actor: {
          adminid: actor.uid,
          role: actor.role,
          superadmin,
        },
        reason,
        note: "UnlockConnector only releases the connector latch. It does not finalize charging/billing. StopTransaction remains the final accounting event.",
      });
    }

    return res.status(400).json({
      message: "Emergency unlock request was not successful",
      unlock_request: {
        status: status || "unknown",
        chargerid,
        connectorid,
      },
      ocpp_http_status: ocppResponse.status,
      ocpp_response: ocppResult,
      note: "Charger may be offline, connector may not support unlock, or charger may reject unlock while charging.",
    });
  } catch (error) {
    console.error("adminEmergencyUnlockConnector error:", error);
    logging("error", error.message, "admin_emergency_unlock_connector.js");
    return res.status(500).json({
      message: "Emergency unlock failed",
      error: error.message,
    });
  }
};

export default adminEmergencyUnlockConnector;
