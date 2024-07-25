/*
  Warnings:

  - A unique constraint covering the columns `[userProfileId]` on the table `Financial_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Financial_details` ADD COLUMN `userProfileId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Financial_details_userProfileId_key` ON `Financial_details`(`userProfileId`);

-- AddForeignKey
ALTER TABLE `Financial_details` ADD CONSTRAINT `Financial_details_userProfileId_fkey` FOREIGN KEY (`userProfileId`) REFERENCES `UserProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
