/*
  Warnings:

  - You are about to drop the column `ipv4addess` on the `iptracker` table. All the data in the column will be lost.
  - You are about to drop the column `ipv6address` on the `iptracker` table. All the data in the column will be lost.
  - You are about to drop the column `originoftheip` on the `iptracker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `iptracker` DROP COLUMN `ipv4addess`,
    DROP COLUMN `ipv6address`,
    DROP COLUMN `originoftheip`,
    ADD COLUMN `datetimeofaccess` VARCHAR(191) NULL,
    ADD COLUMN `filepath` VARCHAR(191) NULL,
    ADD COLUMN `ipaddress` VARCHAR(191) NULL;
