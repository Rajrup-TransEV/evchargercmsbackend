-- AlterTable
ALTER TABLE `UserProfile` ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otpExpiration` DATETIME(3) NULL;
