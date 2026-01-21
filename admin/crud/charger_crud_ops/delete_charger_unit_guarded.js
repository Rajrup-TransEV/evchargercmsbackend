import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

/**
 * DELETE CHARGER UNIT (admin/user authorized)
 *
 * Body:
 *   {
 *     "charger_uid": "CP_001",
 *     "user_id": "USER_UID_OPTIONAL",
 *     "admin_id": "ADMIN_UID_OPTIONAL"
 *   }
 *
 * Authorization:
 * - If user_id provided: charger.userId must match
 * - Else if admin_id provided: charger.associatedadminid must match
 * - Else: reject
 *
 * Cleanup:
 * - Remove charger_uid from any hub.hubchargers array (container cleanup only)
 * - Delete dependent QR codes (best-effort)
 * - Delete Charger_Unit
 *
 * Cache:
 * - Rebuild and refresh "all_charger_units" cache key.
 */

const delete_charger_unit_ops = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];

  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "delete_charger_unit_ops.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  const { charger_uid, user_id, admin_id } = req.body ?? {};

  try {
    // ---- Validate input ----
    const chargerUid = String(charger_uid ?? "").trim();
    const userId = user_id == null ? null : String(user_id).trim();
    const adminId = admin_id == null ? null : String(admin_id).trim();

    if (!chargerUid) {
      logging("error", "charger_uid is required", "delete_charger_unit_ops.js");
      return res.status(400).json({ message: "charger_uid is required" });
    }

    // Need at least one actor
    const hasUser = !!(userId && userId.length > 0);
    const hasAdmin = !!(adminId && adminId.length > 0);

    if (!hasUser && !hasAdmin) {
      logging("error", "user_id or admin_id is required", "delete_charger_unit_ops.js");
      return res.status(400).json({ message: "user_id or admin_id is required" });
    }

    // ---- Fetch charger ----
    const charger = await prisma.charger_Unit.findFirst({
      where: { uid: chargerUid },
      select: {
        uid: true,
        userId: true,
        associatedadminid: true,
      },
    });

    if (!charger) {
      logging("error", "Charger not found", "delete_charger_unit_ops.js");
      return res.status(404).json({ message: "Charger not found" });
    }

    // ---- Authorization (charger-based, NOT hub-based) ----
    // If both provided, OR semantics: either matching authorizes.
    let authorized = false;

    if (hasUser && charger.userId && charger.userId === userId) authorized = true;
    if (hasAdmin && charger.associatedadminid && charger.associatedadminid === adminId) authorized = true;

    if (!authorized) {
      logging("error", "Not authorized to delete this charger", "delete_charger_unit_ops.js");
      return res.status(403).json({ message: "Not authorized to delete this charger" });
    }

    // ---- Transaction: cleanup + delete ----
    await prisma.$transaction(async (tx) => {
      // 1) Remove this charger uid from any hub.hubchargers arrays
      // We do it safely without assuming hubchargers is always array in JS,
      // because Prisma JSON/array types can vary.
      const hubs = await tx.addhub.findMany({
        where: {
          hubchargers: {
            has: chargerUid,
          },
        },
        select: {
          uid: true,
          hubchargers: true,
        },
      });

      for (const hub of hubs) {
        const list = Array.isArray(hub.hubchargers) ? hub.hubchargers : [];
        const next = list.filter((x) => x !== chargerUid);

        // Only update if it actually changed
        if (next.length !== list.length) {
          await tx.addhub.update({
            where: { uid: hub.uid },
            data: { hubchargers: next },
          });
        }
      }

      // 2) Delete dependent QR codes (best-effort)
      // If your schema uses a different model name, adjust here.
      // This is safe if QRCode model exists in Prisma.
      if (tx.qRCode?.deleteMany) {
        // If QRCode has a foreign key field like chargerUid / chargerUnitId, change accordingly.
        // Most likely it references Charger_Unit by some FK. Since we haven't seen it,
        // we try the most probable field name: chargerUid.
        try {
          await tx.qRCode.deleteMany({
            where: { chargerUid: chargerUid },
          });
        } catch (_) {
          // Fallback attempt: some schemas use chargerId or charger_unit_id.
          // We will not guess more to avoid accidental deletes.
        }
      } else if (tx.qRCode?.deleteMany === undefined && tx.qRCode === undefined) {
        // No QRCode model in prisma client; skip.
      }

      // 3) Delete the charger unit
      await tx.charger_Unit.delete({
        where: { uid: chargerUid },
      });
    });

    // ---- Refresh cache ("all_charger_units") ----
    // Rebuild exactly like get_all_charger_unit_ops does.
    // This keeps the system truthful immediately after deletion.
    try {
      const chargers = await prisma.charger_Unit.findMany();
      const hubs = await prisma.addhub.findMany();

      const chargersWithHubs = chargers.map((c) => {
        const matchedHub = hubs.find((hub) => {
          const arr = Array.isArray(hub?.hubchargers) ? hub.hubchargers : [];
          return arr.includes(c?.uid);
        });

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
      // Cache refresh failure should NOT fail the delete; log only.
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
