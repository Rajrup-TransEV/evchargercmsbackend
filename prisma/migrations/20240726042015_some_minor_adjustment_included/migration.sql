-- DropForeignKey
ALTER TABLE `Charger_Unit` DROP FOREIGN KEY `Charger_Unit_userId_fkey`;

-- AlterTable
ALTER TABLE `Charger_Unit` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Charger_Unit` ADD CONSTRAINT `Charger_Unit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
