-- CreateTable
CREATE TABLE `DisputFrom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `customername` VARCHAR(191) NULL,
    `relatedtoev` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `morethanonecharge` VARCHAR(191) NULL,
    `wrongcharged` VARCHAR(191) NULL,
    `didnotreceiverefund` VARCHAR(191) NULL,
    `paidforothermeans` VARCHAR(191) NULL,
    `disputtransaction` VARCHAR(191) NULL,
    `chargedregularly` VARCHAR(191) NULL,
    `notlistedabove` VARCHAR(191) NULL,
    `transactiondetails` VARCHAR(191) NULL,
    `disputedetails` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DisputFrom_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
