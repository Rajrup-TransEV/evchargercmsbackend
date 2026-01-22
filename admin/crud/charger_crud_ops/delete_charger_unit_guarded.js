import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

/**
 * DELETE CHARGER UNIT (charger-associated authority)
 *
 * Body:
 *   {
 *     "charger_uid": "CP_001",
 *     "user_id": "USER_UID_OPTIONAL",
 *     "admin_id": "ADMIN_UID_OPTIONAL"
 *   }
 *
 * Authorization (OR):
 * - If user_id provided: Charger_Unit.userId must match user_id
 * - If admin_id provided: Charger_Unit.associatedadminid must match admin_id
 *
 * Cleanup:
 * - Remove charger uid from Addhub.hubchargers (Json array of charger uids)
 * - Delete QRCode rows where QRCode.chargerid == charger_uid
 * - Delete other non-FK references (Favorites, Bookings, sessions, etc.) where relevant
 * - Delete Charger_Unit by uid
 *
 * Cache:
 * - Rebuild and refresh "all_charger_units"
 */

function toStr(x) {
  return String(x ?? "").trim();
}

function asStringArrayFromJson(value) {
  // hubchargers is Json? — in practice you store an array of strings.
  // This parser is strict: only returns string array, else [].
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  return [];
}

const delete_charger_unit_ops = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];

  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "delete_charger_unit_ops.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { charger_uid, user_id, admin_id } = req.body ?? {};

  try {
    const chargerUid = toStr(charger_uid);
    const userId = user_id == null ? "" : toStr(user_id);
    const adminId = admin_id == null ? "" : toStr(admin_id);

    if (!chargerUid) {
      logging("error", "charger_uid is required", "delete_charger_unit_ops.js");
      return res.status(400).json({ message: "charger_uid is required" });
    }

    const hasUser = userId.length > 0;
    const hasAdmin = adminId.length > 0;

    if (!hasUser && !hasAdmin) {
      logging("error", "user_id or admin_id is required", "delete_charger_unit_ops.js");
      return res.status(400).json({ message: "user_id or admin_id is required" });
    }

    // Fetch charger for authorization (charger-based authority)
    const charger = await prisma.charger_Unit.findFirst({
      where: { uid: chargerUid },
      select: { uid: true, userId: true, associatedadminid: true },
    });

    if (!charger) {
      logging("error", "Charger not found", "delete_charger_unit_ops.js");
      return res.status(404).json({ message: "Charger not found" });
    }

    let authorized = false;
    if (hasUser && charger.userId && charger.userId === userId) authorized = true;
    if (hasAdmin && charger.associatedadminid && charger.associatedadminid === adminId) authorized = true;

    if (!authorized) {
      logging("error", "Not authorized to delete this charger", "delete_charger_unit_ops.js");
      return res.status(403).json({ message: "Not authorized to delete this charger" });
    }

    // Do cleanup + delete atomically
    await prisma.$transaction(async (tx) => {
      // 1) Remove from hubchargers JSON arrays
      // Since hubchargers is Json?, Prisma can't "has" reliably here → scan hubs.
      const hubs = await tx.addhub.findMany({
        select: { uid: true, hubchargers: true },
      });

      for (const hub of hubs) {
        const list = asStringArrayFromJson(hub.hubchargers);
        if (list.length === 0) continue;

        if (!list.includes(chargerUid)) continue;

        const next = list.filter((x) => x !== chargerUid);

        await tx.addhub.update({
          where: { uid: hub.uid },
          data: { hubchargers: next },
        });
      }

      // 2) Delete QRCode children (schema-accurate FK field: chargerid)
      await tx.qRCode.deleteMany({
        where: { chargerid: chargerUid },
      });

      // 3) Optional cleanup of string-references (no FK, but prevents orphan junk)
      await tx.favorites.deleteMany({ where: { chargeruid: chargerUid } });
      await tx.bookings.deleteMany({ where: { chargeruid: chargerUid } });
      await tx.charingsessions.deleteMany({ where: { chargerid: chargerUid } });
      await tx.chargerTransaction.deleteMany({ where: { chargerid: chargerUid } });
      await tx.transactionsdetails.deleteMany({ where: { chargeruid: chargerUid } });
      // If you want to also clean UserBilling, uncomment:
      // await tx.userBilling.deleteMany({ where: { chargerid: chargerUid } });

      // 4) Finally delete charger unit (uid is @unique)
      await tx.charger_Unit.delete({
        where: { uid: chargerUid },
      });
    });

    // Refresh "all_charger_units" cache (rebuild same way as your list endpoint)
    try {
      const chargers = await prisma.charger_Unit.findMany();
      const hubs = await prisma.addhub.findMany();

      const chargersWithHubs = chargers.map((c) => {
        const cuid = c?.uid;

        let matchedHub = null;
        for (const hub of hubs) {
          const list = asStringArrayFromJson(hub?.hubchargers);
          if (cuid && list.includes(cuid)) {
            matchedHub = hub;
            break;
          }
        }

        return {
          ...c,
          hubinfo: matchedHub
            ? {
                uid: matchedHub.uid,
                hubname: matchedHub.hubname,
                hubtariff: matchedHub.hubtariff,
                hublocation: matchedHub.hublocation,
                adminuid: matchedHub.adminuid,
              }
            : null,
        };
      });

      await setCache("all_charger_units", chargersWithHubs, 3600);
    } catch (e) {
      logging("error", `Cache refresh failed - ${e.message}`, "delete_charger_unit_ops.js");
    }

    logging("success", "Charger deleted successfully", "delete_charger_unit_ops.js");
    return res.status(200).json({ message: "Charger deleted successfully", charger_uid: chargerUid });
  } catch (error) {
    console.log(error);
    logging("error", `${error.message}`, "delete_charger_unit_ops.js");
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export default delete_charger_unit_ops;
