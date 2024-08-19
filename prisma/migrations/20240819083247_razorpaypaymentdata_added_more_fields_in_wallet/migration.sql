/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `RazorpayData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `RazorpayData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `RazorpayData` ADD COLUMN `amount` VARCHAR(191) NULL,
    ADD COLUMN `attempts` VARCHAR(191) NULL,
    ADD COLUMN `currency` VARCHAR(191) NULL,
    ADD COLUMN `method` VARCHAR(191) NULL,
    ADD COLUMN `orderId` VARCHAR(191) NULL,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `wallet` ADD COLUMN `iswalletrechargedone` BOOLEAN NULL,
    ADD COLUMN `price` VARCHAR(191) NULL,
    ADD COLUMN `razorpayuri` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RazorpayData_orderId_key` ON `RazorpayData`(`orderId`);

-- CreateIndex
CREATE UNIQUE INDEX `RazorpayData_paymentId_key` ON `RazorpayData`(`paymentId`);
