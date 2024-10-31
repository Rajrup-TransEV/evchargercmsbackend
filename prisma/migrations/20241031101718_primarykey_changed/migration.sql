/*
  Warnings:

  - The primary key for the `Addhub` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Analytics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AssignRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Assigntovechicles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Assigntovehicleowener` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Bookings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Charger_Unit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Counter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DailySignup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DisputFrom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Favorites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Financial_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HelpandSupport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Minimumbalance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QRCode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RazorpayData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TransactionHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Transactionsdetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `iptracker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `wallet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `walletreachargehistory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `Addhub` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Analytics` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `AssignRoles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Assigntovechicles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Assigntovehicleowener` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Bookings` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Charger_Unit` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Counter` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DailySignup` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DisputFrom` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Favorites` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Financial_details` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `HelpandSupport` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Minimumbalance` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `QRCode` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `RazorpayData` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `TransactionHistory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Transactionsdetails` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserProfile` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `iptracker` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `wallet` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `walletreachargehistory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
