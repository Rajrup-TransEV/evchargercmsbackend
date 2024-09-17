/*
  Warnings:

  - A unique constraint covering the columns `[adminid]` on the table `Addhub` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Addhub` ADD COLUMN `adminid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Addhub_adminid_key` ON `Addhub`(`adminid`);

-- AddForeignKey
ALTER TABLE `Addhub` ADD CONSTRAINT `Addhub_adminid_fkey` FOREIGN KEY (`adminid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
