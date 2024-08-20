/*
  Warnings:

  - You are about to drop the column `razorpayuri` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `razorpayuri`,
    ADD COLUMN `recharger_made_by_which_user` VARCHAR(191) NULL;
