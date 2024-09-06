/*
  Warnings:

  - You are about to drop the column `chargercapacity` on the `qrcode` table. All the data in the column will be lost.
  - You are about to drop the column `chargerserialnumber` on the `qrcode` table. All the data in the column will be lost.
  - You are about to drop the column `totalchargetime` on the `qrcode` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `qrcode` DROP COLUMN `chargercapacity`,
    DROP COLUMN `chargerserialnumber`,
    DROP COLUMN `totalchargetime`;
