/*
  Warnings:

  - You are about to drop the column `chargingstation` on the `DynamicRate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `DynamicRate` DROP COLUMN `chargingstation`,
    ADD COLUMN `chargingstationid` VARCHAR(255) NULL;
