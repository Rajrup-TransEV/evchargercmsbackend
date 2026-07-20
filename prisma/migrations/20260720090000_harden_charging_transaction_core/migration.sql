-- This migration is deliberately additive. Run:
--   npm run preflight:transaction-core
-- before deploying it. Unique-index creation will fail safely if legacy duplicates
-- have not been reconciled.

ALTER TABLE `ChargerTransaction`
    ADD COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
    ADD COLUMN `stoprequestedat` DATETIME(3) NULL,
    ADD COLUMN `completedat` DATETIME(3) NULL,
    ADD COLUMN `stopattempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `laststoperror` TEXT NULL,
    ADD COLUMN `laststopattemptat` DATETIME(3) NULL,
    ADD COLUMN `nextstopattemptat` DATETIME(3) NULL;

-- A historical row is only known-complete when its exact OCPP transaction ID has
-- a completion row. Unmatched legacy rows remain UNKNOWN and are never assumed live.
UPDATE `ChargerTransaction` AS ct
LEFT JOIN `Charingsessions` AS cs
  ON cs.`sessionid` = ct.`transactionid`
SET
  ct.`status` = CASE WHEN cs.`id` IS NULL THEN 'UNKNOWN' ELSE 'COMPLETED' END,
  ct.`completedat` = CASE WHEN cs.`id` IS NULL THEN NULL ELSE cs.`createdAt` END;

ALTER TABLE `ChargerTransaction`
    MODIFY `transactionid` VARCHAR(255) NOT NULL;
CREATE UNIQUE INDEX `ChargerTransaction_transactionid_key`
    ON `ChargerTransaction`(`transactionid`);
CREATE INDEX `ChargerTransaction_userid_status_createdAt_idx`
    ON `ChargerTransaction`(`userid`, `status`, `createdAt`);
CREATE INDEX `ChargerTransaction_chargerid_status_createdAt_idx`
    ON `ChargerTransaction`(`chargerid`, `status`, `createdAt`);
CREATE INDEX `ChargerTransaction_status_nextstopattemptat_idx`
    ON `ChargerTransaction`(`status`, `nextstopattemptat`);

ALTER TABLE `Charingsessions`
    MODIFY `sessionid` VARCHAR(255) NOT NULL;
CREATE UNIQUE INDEX `Charingsessions_sessionid_key`
    ON `Charingsessions`(`sessionid`);
ALTER TABLE `TransactionHistory`
    MODIFY `paymentid` VARCHAR(255) NOT NULL;
CREATE UNIQUE INDEX `TransactionHistory_paymentid_key`
    ON `TransactionHistory`(`paymentid`);
CREATE UNIQUE INDEX `Transactionsdetails_paymentid_key`
    ON `Transactionsdetails`(`paymentid`);
CREATE UNIQUE INDEX `wallet_appuserrelatedwallet_key`
    ON `wallet`(`appuserrelatedwallet`);
CREATE UNIQUE INDEX `wallet_userprofilerelatedwallet_key`
    ON `wallet`(`userprofilerelatedwallet`);

ALTER TABLE `UserBilling`
    ADD COLUMN `sessionid` VARCHAR(255) NULL;
CREATE UNIQUE INDEX `UserBilling_sessionid_key`
    ON `UserBilling`(`sessionid`);

CREATE TABLE `BillingJob` (
    `id` VARCHAR(191) NOT NULL,
    `transactionid` VARCHAR(255) NOT NULL,
    `userid` VARCHAR(255) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxattempts` INTEGER NOT NULL DEFAULT 10,
    `nextattemptat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastError` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingJob_transactionid_key`(`transactionid`),
    INDEX `BillingJob_status_nextattemptat_idx`(`status`, `nextattemptat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChargingStartIntent` (
    `id` VARCHAR(191) NOT NULL,
    `userid` VARCHAR(255) NOT NULL,
    `chargerid` VARCHAR(255) NOT NULL,
    `connectorid` VARCHAR(255) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'REQUESTING',
    `expiresat` DATETIME(3) NOT NULL,
    `lastError` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChargingStartIntent_userid_key`(`userid`),
    INDEX `ChargingStartIntent_expiresat_idx`(`expiresat`),
    UNIQUE INDEX `ChargingStartIntent_chargerid_connectorid_key`(`chargerid`, `connectorid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
