-- AlterTable
ALTER TABLE `AssignRoles` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Charger_Unit` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Financial_details` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `UserProfile` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;
