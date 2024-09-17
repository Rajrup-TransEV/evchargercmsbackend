/*
  Warnings:

  - You are about to drop the column `adminid` on the `Addhub` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Addhub` DROP FOREIGN KEY `Addhub_adminid_fkey`;

-- AlterTable
ALTER TABLE `Addhub` DROP COLUMN `adminid`,
    ADD COLUMN `adminuid` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Addhub` ADD CONSTRAINT `Addhub_adminuid_fkey` FOREIGN KEY (`adminuid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
