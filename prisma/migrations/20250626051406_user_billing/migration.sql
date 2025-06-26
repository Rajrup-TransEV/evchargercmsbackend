-- CreateTable
CREATE TABLE `UserBilling` (
    `id` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(255) NULL,
    `userid` VARCHAR(255) NULL,
    `chargerid` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `walletid` VARCHAR(255) NULL,
    `lasttransaction` VARCHAR(255) NULL,
    `balancededuct` VARCHAR(255) NULL,
    `energyconsumption` VARCHAR(255) NULL,
    `chargingtime` VARCHAR(255) NULL,
    `associatedadminid` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserBilling_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
