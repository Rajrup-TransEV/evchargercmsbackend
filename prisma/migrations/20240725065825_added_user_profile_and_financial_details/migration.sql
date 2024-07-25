/*
  Warnings:

  - You are about to drop the column `userid` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uid]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `UserProfile` DROP FOREIGN KEY `UserProfile_userid_fkey`;

-- AlterTable
ALTER TABLE `UserProfile` DROP COLUMN `userid`,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `phonenumber` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NULL,
    ADD COLUMN `uid` VARCHAR(191) NULL;

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

    UNIQUE INDEX `Financial_details_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `UserProfile_uid_key` ON `UserProfile`(`uid`);
