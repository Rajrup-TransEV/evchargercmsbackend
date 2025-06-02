-- CreateTable
CREATE TABLE `DynamicRate` (
    `id` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(255) NULL,
    `chargerid` VARCHAR(255) NULL,
    `chargingstation` VARCHAR(255) NULL,
    `rate` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DynamicRate_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
