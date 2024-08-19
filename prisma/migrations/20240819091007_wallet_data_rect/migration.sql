/*
  Warnings:

  - You are about to drop the column `userrelatedwallet` on the `wallet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `wallet_userrelatedwallet_fkey`;

-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `userrelatedwallet`,
    ADD COLUMN `appuserrelatedwallet` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_appuserrelatedwallet_fkey` FOREIGN KEY (`appuserrelatedwallet`) REFERENCES `AppUserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
