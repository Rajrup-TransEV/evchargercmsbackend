-- CreateTable
CREATE TABLE `Addhub` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `hubname` VARCHAR(191) NULL,
    `hubchargers` VARCHAR(191) NULL,
    `hubtariff` VARCHAR(191) NULL,
    `hublocation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Addhub_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
