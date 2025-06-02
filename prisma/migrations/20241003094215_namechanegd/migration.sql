/*
  Warnings:

  - You are about to drop the column `associaredadminuid` on the `wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `wallet` DROP COLUMN `associaredadminuid`,
    ADD COLUMN `associatedadminuid` VARCHAR(191) NULL;
