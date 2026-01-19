import { PrismaClient } from "@prisma/client";
import logging from "../../../logging/logging_generate.js";
import { getCache, setCache } from "../../../utils/cacheops.js";

const prisma = new PrismaClient();

/**
 * search_all_chargers.js
 *
 * Query params (all optional):
 *   q                : string (fuzzy search)
 *   limit            : number (1..200, default 50)
 *   offset           : number (>=0, default 0)
 *
 * Filters:
 *   hub_uid          : exact hub uid
 *   adminuid         : exact hub adminuid (from hubinfo)
 *   segment          : exact (normalized compare)
 *   subsegment       : exact (normalized compare)
 *   protocol         : exact (normalized compare)
 *   use_type         : charger_use_type exact (normalized compare)
 *   open_247         : twenty_four_seven_open_status exact (normalized compare)
 *   connector_type   : Connector_type exact (normalized compare)
 *   charger_type     : Chargertype exact (normalized compare)
 *
 * Geo boost:
 *   lat, lng         : floats (optional)
 *
 * Output:
 *   { message, data, meta }
 *
 * Notes:
 * - Location priority: hub.hublocation > charger.full_address
 * - Uses in-process memoization + cache-backed source list.
 */

// -------------------- normalize/tokenize --------------------
function normalize(s) {
  return (s ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(norm) {
  if (!norm) return [];
  const parts = norm.split(" ");
  const out = [];
  for (const p of parts) {
    if (p.length >= 2) out.push(p);
    else if (/^\d+$/.test(p)) out.push(p);
  }
  return [...new Set(out)];
}

// -------------------- bounded levenshtein --------------------
function levenshteinBounded(a, b, maxDist) {
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (Math.abs(al - bl) > maxDist) return maxDist + 1;
  if (al === 0) return bl <= maxDist ? bl : maxDist + 1;
  if (bl === 0) return al <= maxDist ? al : maxDist + 1;

  let prev = new Array(bl + 1);
  let curr = new Array(bl + 1);

  for (let j = 0; j <= bl; j++) prev[j] = j;

  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    let rowMin = curr[0];

    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= bl; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      const v = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }

    if (rowMin > maxDist) return maxDist + 1;
    const tmp = prev; prev = curr; curr = tmp;
  }

  return prev[bl];
}

function kForToken(tok) {
  const n = tok.length;
  if (n <= 3) return 1;
  if (n <= 6) return 2;
  return 3;
}

// -------------------- VP tree over tokens --------------------
function buildVPTree(items, distExactFn) {
  function build(arr) {
    if (arr.length === 0) return null;
    const vp = arr[arr.length - 1];
    const rest = arr.slice(0, -1);
    if (rest.length === 0) return { vp, child: null };

    const buckets = new Map(); // d -> items
    for (const it of rest) {
      const d = distExactFn(vp.value, it.value);
      if (!buckets.has(d)) buckets.set(d, []);
      buckets.get(d).push(it);
    }

    const child = new Map();
    for (const [d, group] of buckets.entries()) child.set(d, build(group));
    return { vp, child };
  }
  return build(items);
}

function vpSearch(tree, query, k, distBoundedFn, out = []) {
  if (!tree) return out;

  const d0 = distBoundedFn(query, tree.vp.value, k);
  if (d0 <= k) out.push({ key: tree.vp.key, d: d0 });

  const lo = d0 - k;
  const hi = d0 + k;

  if (tree.child) {
    for (const [d, subtree] of tree.child.entries()) {
      if (d >= lo && d <= hi) vpSearch(subtree, query, k, distBoundedFn, out);
    }
  }
  return out;
}

// -------------------- geo utils --------------------
function parseFloatOrNull(x) {
  const v = Number.parseFloat(String(x ?? "").trim());
  return Number.isFinite(v) ? v : null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -------------------- building docs + inverted index --------------------
function chargerLocationText(charger) {
  const hub = charger?.hubinfo ?? null;
  // Priority: hub location > charger full_address
  return hub?.hublocation ?? charger?.full_address ?? "";
}

function buildSearchIndex(chargersWithHubs) {
  const docs = new Map();          // uid -> doc
  const tokenToUids = new Map();   // token -> Set(uid)
  const vocab = new Set();         // tokens

  for (const c of chargersWithHubs) {
    const uid = c?.uid;
    if (typeof uid !== "string" || uid.trim().length === 0) continue;

    const hub = c?.hubinfo ?? null;

    const locationRaw = chargerLocationText(c);
    const locationNorm = normalize(locationRaw);

    const primaryRaw = [
      c?.ChargerName,
      c?.Chargertype,
      c?.Connector_type,
      c?.Segment,
      c?.Subsegment,
      c?.uid,
      c?.Chargerserialnum,
      c?.chargeridentity,
      hub?.hubname,
      hub?.hublocation,
      hub?.hubtariff,
    ].filter(Boolean).join(" ");

    const textNorm = normalize(primaryRaw);

    const textTokens = tokenize(textNorm);
    const locationTokens = tokenize(locationNorm);
    const allTokensSet = new Set([...textTokens, ...locationTokens]);
    const allTokens = [...allTokensSet];

    const lat = parseFloatOrNull(c?.lattitude);
    const lng = parseFloatOrNull(c?.longitute);

    docs.set(uid, {
      uid,
      charger: c,
      textNorm,
      locationNorm,
      textTokens,
      locationTokens,
      allTokens,
      allTokenSet: allTokensSet, // for fast membership
      lat,
      lng,
    });

    for (const t of allTokensSet) {
      vocab.add(t);
      let set = tokenToUids.get(t);
      if (!set) {
        set = new Set();
        tokenToUids.set(t, set);
      }
      set.add(uid);
    }
  }

  const vocabItems = Array.from(vocab).map((t) => ({ key: t, value: t }));

  const distExact = (a, b) => {
    // exact because cap >= true distance
    const cap = Math.max(a.length, b.length);
    return levenshteinBounded(a, b, cap);
  };
  const distBounded = (a, b, k) => levenshteinBounded(a, b, k);

  const vpTree = buildVPTree(vocabItems, distExact);
  return { docs, tokenToUids, vpTree, distBounded };
}

// -------------------- filters --------------------
function normEq(a, b) {
  return normalize(a) === normalize(b);
}

function applyFilters(charger, filters) {
  // charger already has hubinfo merged
  const hub = charger?.hubinfo ?? null;

  if (filters.hub_uid && (!hub || hub.uid !== filters.hub_uid)) return false;
  if (filters.adminuid && (!hub || hub.adminuid !== filters.adminuid)) return false;

  if (filters.segment && !normEq(charger?.Segment, filters.segment)) return false;
  if (filters.subsegment && !normEq(charger?.Subsegment, filters.subsegment)) return false;
  if (filters.protocol && !normEq(charger?.protocol, filters.protocol)) return false;
  if (filters.use_type && !normEq(charger?.charger_use_type, filters.use_type)) return false;
  if (filters.open_247 && !normEq(charger?.twenty_four_seven_open_status, filters.open_247)) return false;

  if (filters.connector_type && !normEq(charger?.Connector_type, filters.connector_type)) return false;
  if (filters.charger_type && !normEq(charger?.Chargertype, filters.charger_type)) return false;

  return true;
}

// -------------------- scoring --------------------
function scoreCandidate(qTokens, doc, userLat, userLng) {
  // For each query token, find best doc token (bounded distance)
  let sumSim = 0;

  for (const qt of qTokens) {
    const k = kForToken(qt);

    let bestTok = null;
    let bestD = k + 1;

    // Fast path: check if exact token present
    if (doc.allTokenSet.has(qt)) {
      bestTok = qt;
      bestD = 0;
    } else {
      for (const dt of doc.allTokens) {
        const d = levenshteinBounded(qt, dt, k);
        if (d < bestD) {
          bestD = d;
          bestTok = dt;
          if (bestD === 0) break;
        }
      }
    }

    const denom = Math.max(qt.length, (bestTok?.length ?? 1), 1);
    const sim = 1 - (Math.min(bestD, denom) / denom);
    sumSim += Math.max(0, sim);
  }

  const textScore = qTokens.length ? (sumSim / qTokens.length) : 0;

  // extra: tiny preference if query hits location tokens
  let locHit = 0;
  for (const qt of qTokens) if (doc.locationTokens.includes(qt)) locHit++;
  const locScore = qTokens.length ? (locHit / qTokens.length) : 0;

  // optional geo boost
  let geoScore = 0;
  if (
    Number.isFinite(userLat) && Number.isFinite(userLng) &&
    Number.isFinite(doc.lat) && Number.isFinite(doc.lng)
  ) {
    const km = haversineKm(userLat, userLng, doc.lat, doc.lng);
    geoScore = 1 / (1 + km); // 0..1-ish
  }

  // weights: text dominates; location mild; geo mild
  return (textScore * 0.80) + (locScore * 0.10) + (geoScore * 0.10);
}

// -------------------- fuzzy search pipeline --------------------
function fuzzySearch(index, query, filters, userLat, userLng, limit, offset) {
  const qNorm = normalize(query);
  const qTokens = tokenize(qNorm);
  if (qTokens.length === 0) return { rows: [], total: 0 };

  // Candidate UID set via VP-tree token expansion -> inverted index
  const candidateUids = new Set();

  for (const qt of qTokens) {
    const k = kForToken(qt);
    const hits = vpSearch(index.vpTree, qt, k, index.distBounded);
    if (hits.length === 0) {
      // fallback exact token
      const uids = index.tokenToUids.get(qt);
      if (uids) for (const uid of uids) candidateUids.add(uid);
      continue;
    }
    // take best few hits (avoid noise)
    hits.sort((a, b) => a.d - b.d);
    for (const h of hits.slice(0, 8)) {
      const uids = index.tokenToUids.get(h.key);
      if (uids) for (const uid of uids) candidateUids.add(uid);
    }
  }

  // Score + filter
  const scored = [];
  for (const uid of candidateUids) {
    const doc = index.docs.get(uid);
    if (!doc) continue;

    const charger = doc.charger;
    if (!applyFilters(charger, filters)) continue;

    const score = scoreCandidate(qTokens, doc, userLat, userLng);
    if (score <= 0.20) continue; // conservative cutoff to avoid garbage
    scored.push({ uid, score, charger });
  }

  scored.sort((a, b) => b.score - a.score);

  const total = scored.length;
  const page = scored.slice(offset, offset + limit).map((x) => x.charger);
  return { rows: page, total };
}

// If no q provided: just filter (no fuzzy) — still a “real filter endpoint”
function filterOnly(chargers, filters, limit, offset) {
  const filtered = chargers.filter((c) => applyFilters(c, filters));
  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);
  return { rows: page, total };
}

// -------------------- memoized index --------------------
let _memo = { fp: null, index: null };

function fingerprint(list) {
  if (!Array.isArray(list)) return "0";
  const n = list.length;
  const sample = [];
  for (let i = 0; i < n && sample.length < 10; i += Math.max(1, Math.floor(n / 10))) {
    const uid = list[i]?.uid;
    if (typeof uid === "string") sample.push(uid);
  }
  return `${n}:${sample.join("|")}`;
}

// -------------------- handler --------------------
const search_all_chargers = async (req, res) => {
  const apiauthkey = req.headers["apiauthkey"];
  if (!apiauthkey || apiauthkey !== process.env.API_KEY) {
    logging("error", "API route access error", "search_all_chargers.js");
    return res.status(403).json({ message: "API route access forbidden" });
  }

  try {
    const q = (req.query?.q ?? "").toString().trim();

    const limitRaw = Number.parseInt(String(req.query?.limit ?? ""), 10);
    const offsetRaw = Number.parseInt(String(req.query?.offset ?? ""), 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    const userLat = parseFloatOrNull(req.query?.lat);
    const userLng = parseFloatOrNull(req.query?.lng);

    const filters = {
      hub_uid: req.query?.hub_uid ? String(req.query.hub_uid) : null,
      adminuid: req.query?.adminuid ? String(req.query.adminuid) : null,
      segment: req.query?.segment ? String(req.query.segment) : null,
      subsegment: req.query?.subsegment ? String(req.query.subsegment) : null,
      protocol: req.query?.protocol ? String(req.query.protocol) : null,
      use_type: req.query?.use_type ? String(req.query.use_type) : null,
      open_247: req.query?.open_247 ? String(req.query.open_247) : null,
      connector_type: req.query?.connector_type ? String(req.query.connector_type) : null,
      charger_type: req.query?.charger_type ? String(req.query.charger_type) : null,
    };

    // source list: prefer cache (same key you already use), else fetch and build once
    let chargersWithHubs = await getCache("all_charger_units");
    if (!chargersWithHubs) {
      const chargers = await prisma.charger_Unit.findMany();
      const hubs = await prisma.addhub.findMany();

      chargersWithHubs = chargers.map((charger) => {
        const cuid = charger?.uid;
        const matchedHub = hubs.find((hub) => {
          const arr = Array.isArray(hub?.hubchargers) ? hub.hubchargers : [];
          return arr.includes(cuid);
        });

        return {
          ...charger,
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
    }

    // If q empty: do real filter-only
    if (!q) {
      const { rows, total } = filterOnly(chargersWithHubs, filters, limit, offset);
      return res.status(200).json({
        message: "Filtered charger list is coming",
        data: rows,
        meta: { total, limit, offset, query: "", filters }
      });
    }

    // Build/reuse index
    const fp = fingerprint(chargersWithHubs);
    if (_memo.fp !== fp || !_memo.index) {
      _memo.index = buildSearchIndex(chargersWithHubs);
      _memo.fp = fp;
    }

    const { rows, total } = fuzzySearch(_memo.index, q, filters, userLat, userLng, limit, offset);

    return res.status(200).json({
      message: "Searched charger list is coming",
      data: rows,
      meta: { total, limit, offset, query: q, filters, geo: (Number.isFinite(userLat) && Number.isFinite(userLng)) ? { lat: userLat, lng: userLng } : null }
    });

  } catch (error) {
    console.log(error);
    logging("error", `${error.message}`, "search_all_chargers.js");
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export default search_all_chargers;
