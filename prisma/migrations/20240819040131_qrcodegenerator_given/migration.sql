-- CreateTable
CREATE TABLE `qrcode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `chargerserialnumber` VARCHAR(191) NULL,
    `chargerid` VARCHAR(191) NULL,
    `chargercapacity` VARCHAR(191) NULL,
    `totalchargetime` VARCHAR(191) NULL,
    `qrcodedata` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `qrcode_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
