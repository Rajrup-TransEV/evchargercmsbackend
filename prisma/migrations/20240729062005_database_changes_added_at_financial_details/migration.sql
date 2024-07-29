-- DropForeignKey
ALTER TABLE `Financial_details` DROP FOREIGN KEY `Financial_details_userProfileId_fkey`;

-- AlterTable
ALTER TABLE `Financial_details` MODIFY `userProfileId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Financial_details` ADD CONSTRAINT `Financial_details_userProfileId_fkey` FOREIGN KEY (`userProfileId`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
