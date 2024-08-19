-- CreateTable
CREATE TABLE `wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `userprofilerelatedwallet` VARCHAR(191) NULL,
    `userrelatedwallet` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallet_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_userprofilerelatedwallet_fkey` FOREIGN KEY (`userprofilerelatedwallet`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_userrelatedwallet_fkey` FOREIGN KEY (`userrelatedwallet`) REFERENCES `AppUserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
