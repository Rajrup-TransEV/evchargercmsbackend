-- AlterTable
ALTER TABLE `Addhub` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Analytics` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Bookings` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `DailySignup` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Favorites` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `HelpandSupport` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `LogRetention` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Minimumbalance` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `QRCode` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `RazorpayData` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `TransactionHistory` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Transactionsdetails` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `iptracker` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `walletreachargehistory` ADD COLUMN `associatedadminid` VARCHAR(255) NULL;
