-- AlterTable
ALTER TABLE `ChargerTransaction` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Charingsessions` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;
