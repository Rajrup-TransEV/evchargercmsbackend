-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `userType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_uid_key`(`uid`),
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phonenumber` VARCHAR(191) NULL,
    `role` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Financial_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `isfc_code` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `branch_name` VARCHAR(191) NULL,
    `branch_address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userProfileId` INTEGER NULL,

    UNIQUE INDEX `Financial_details_uid_key`(`uid`),
    UNIQUE INDEX `Financial_details_userProfileId_key`(`userProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Charger_Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `ChargerName` VARCHAR(191) NULL,
    `Chargerhost` VARCHAR(191) NULL,
    `Segment` VARCHAR(191) NULL,
    `Subsegment` VARCHAR(191) NULL,
    `Total_Capacity` VARCHAR(191) NULL,
    `Chargertype` VARCHAR(191) NULL,
    `parking` VARCHAR(191) NULL,
    `number_of_connectors` VARCHAR(191) NULL,
    `Connector_type` VARCHAR(191) NULL,
    `connector_total_capacity` VARCHAR(191) NULL,
    `lattitude` VARCHAR(191) NULL,
    `longitute` VARCHAR(191) NULL,
    `full_address` VARCHAR(191) NULL,
    `charger_use_type` VARCHAR(191) NULL,
    `twenty_four_seven_open_status` VARCHAR(191) NULL,
    `charger_image` VARCHAR(191) NULL,
    `userId` INTEGER NULL,

    UNIQUE INDEX `Charger_Unit_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Financial_details` ADD CONSTRAINT `Financial_details_userProfileId_fkey` FOREIGN KEY (`userProfileId`) REFERENCES `UserProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Charger_Unit` ADD CONSTRAINT `Charger_Unit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
