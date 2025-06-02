-- CreateTable
CREATE TABLE `Charingsessions` (
    `id` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(255) NULL,
    `sessionid` VARCHAR(255) NULL,
    `chargerid` VARCHAR(255) NULL,
    `startime` VARCHAR(255) NULL,
    `stoptime` VARCHAR(255) NULL,
    `meterstart` VARCHAR(255) NULL,
    `meterstop` VARCHAR(255) NULL,
    `consumedkwh` VARCHAR(255) NULL,
    `totalcost` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Charingsessions_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
