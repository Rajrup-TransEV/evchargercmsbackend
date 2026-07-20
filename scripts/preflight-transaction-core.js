import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const checks = [
  ["missing OCPP transaction IDs", `
    SELECT '<NULL>' AS value, COUNT(*) AS count
    FROM ChargerTransaction
    WHERE transactionid IS NULL
    HAVING COUNT(*) > 0
  `],
  ["duplicate OCPP transaction IDs", `
    SELECT transactionid AS value, COUNT(*) AS count
    FROM ChargerTransaction
    WHERE transactionid IS NOT NULL
    GROUP BY transactionid HAVING COUNT(*) > 1
  `],
  ["non-decimal OCPP transaction IDs", `
    SELECT transactionid AS value, 1 AS count
    FROM ChargerTransaction
    WHERE transactionid IS NOT NULL
      AND transactionid NOT REGEXP '^[1-9][0-9]*$'
  `],
  ["out-of-range OCPP transaction IDs", `
    SELECT transactionid AS value, 1 AS count
    FROM ChargerTransaction
    WHERE transactionid REGEXP '^[1-9][0-9]*$'
      AND CAST(transactionid AS DECIMAL(65, 0)) > 2147483647
  `],
  ["missing charging session IDs", `
    SELECT '<NULL>' AS value, COUNT(*) AS count
    FROM Charingsessions
    WHERE sessionid IS NULL
    HAVING COUNT(*) > 0
  `],
  ["duplicate charging session IDs", `
    SELECT sessionid AS value, COUNT(*) AS count
    FROM Charingsessions
    WHERE sessionid IS NOT NULL
    GROUP BY sessionid HAVING COUNT(*) > 1
  `],
  ["non-decimal charging session IDs", `
    SELECT sessionid AS value, 1 AS count
    FROM Charingsessions
    WHERE sessionid IS NOT NULL
      AND sessionid NOT REGEXP '^[1-9][0-9]*$'
  `],
  ["out-of-range charging session IDs", `
    SELECT sessionid AS value, 1 AS count
    FROM Charingsessions
    WHERE sessionid REGEXP '^[1-9][0-9]*$'
      AND CAST(sessionid AS DECIMAL(65, 0)) > 2147483647
  `],
  ["completion rows whose user or charger differs from the start row", `
    SELECT ct.transactionid AS value, COUNT(*) AS count
    FROM ChargerTransaction ct
    INNER JOIN Charingsessions cs ON cs.sessionid = ct.transactionid
    WHERE COALESCE(ct.userid, '') <> COALESCE(cs.userid, '')
       OR COALESCE(ct.chargerid, '') <> COALESCE(cs.chargerid, '')
    GROUP BY ct.transactionid
  `],
  ["duplicate charging history payment IDs", `
    SELECT paymentid AS value, COUNT(*) AS count
    FROM TransactionHistory
    WHERE paymentid IS NOT NULL
    GROUP BY paymentid HAVING COUNT(*) > 1
  `],
  ["missing charging history payment IDs", `
    SELECT '<NULL>' AS value, COUNT(*) AS count
    FROM TransactionHistory
    WHERE paymentid IS NULL
    HAVING COUNT(*) > 0
  `],
  ["duplicate recharge payment IDs", `
    SELECT paymentid AS value, COUNT(*) AS count
    FROM Transactionsdetails
    WHERE paymentid IS NOT NULL
    GROUP BY paymentid HAVING COUNT(*) > 1
  `],
  ["duplicate passenger wallets", `
    SELECT appuserrelatedwallet AS value, COUNT(*) AS count
    FROM wallet
    WHERE appuserrelatedwallet IS NOT NULL
    GROUP BY appuserrelatedwallet HAVING COUNT(*) > 1
  `],
  ["duplicate staff wallets", `
    SELECT userprofilerelatedwallet AS value, COUNT(*) AS count
    FROM wallet
    WHERE userprofilerelatedwallet IS NOT NULL
    GROUP BY userprofilerelatedwallet HAVING COUNT(*) > 1
  `],
  ["wallet identity present in both passenger and staff columns", `
    SELECT passenger.appuserrelatedwallet AS value, COUNT(*) AS count
    FROM wallet passenger
    INNER JOIN wallet staff
      ON staff.userprofilerelatedwallet = passenger.appuserrelatedwallet
    WHERE passenger.appuserrelatedwallet IS NOT NULL
    GROUP BY passenger.appuserrelatedwallet
  `],
  ["UID collision between passenger and staff tables", `
    SELECT passenger.uid AS value, COUNT(*) AS count
    FROM User passenger
    INNER JOIN UserProfile staff ON staff.uid = passenger.uid
    WHERE passenger.uid IS NOT NULL
    GROUP BY passenger.uid
  `],
];

let failed = false;
try {
  for (const [label, sql] of checks) {
    const rows = await prisma.$queryRawUnsafe(sql);
    if (rows.length === 0) {
      console.log(`PASS: ${label}`);
      continue;
    }

    failed = true;
    console.error(`FAIL: ${label}`);
    for (const row of rows.slice(0, 20)) {
      console.error(`  ${row.value}: ${String(row.count)}`);
    }
    if (rows.length > 20) console.error(`  ...and ${rows.length - 20} more`);
  }
} finally {
  await prisma.$disconnect();
}

if (failed) {
  console.error("Transaction-core migration blocked. Reconcile the rows above and rerun preflight.");
  process.exitCode = 1;
} else {
  console.log("Transaction-core preflight passed.");
}
