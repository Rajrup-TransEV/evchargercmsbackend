-- AlterTable
ALTER TABLE `UserBilling` ADD COLUMN `gstamount` VARCHAR(255) NULL,
    ADD COLUMN `taxableamount` VARCHAR(255) NULL,
    ADD COLUMN `totalamount` VARCHAR(255) NULL;
