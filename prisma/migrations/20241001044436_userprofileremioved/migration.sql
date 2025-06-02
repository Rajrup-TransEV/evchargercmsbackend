/*
  Warnings:

  - You are about to drop the `AppUserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AppUserProfile` DROP FOREIGN KEY `AppUserProfile_userId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `phonenumber` VARCHAR(191) NULL,
    ADD COLUMN `profilepicture` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `AppUserProfile`;
