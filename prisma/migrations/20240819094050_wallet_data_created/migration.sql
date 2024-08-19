-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `wallet_appuserrelatedwallet_fkey`;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_appuserrelatedwallet_fkey` FOREIGN KEY (`appuserrelatedwallet`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
