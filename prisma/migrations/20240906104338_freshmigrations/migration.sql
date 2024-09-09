-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `userType` VARCHAR(191) NULL,
    `otp` VARCHAR(191) NULL,
    `otpExpiration` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_uid_key`(`uid`),
    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppUserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phonenumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `AppUserProfile_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `phonenumber` VARCHAR(191) NULL,
    `role` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `otp` VARCHAR(191) NULL,
    `otpExpiration` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_uid_key`(`uid`),
    UNIQUE INDEX `UserProfile_email_key`(`email`),
    UNIQUE INDEX `UserProfile_phonenumber_key`(`phonenumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Financial_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `isfc_code` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `branch_name` VARCHAR(191) NULL,
    `branch_address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userProfileId` VARCHAR(191) NULL,

    UNIQUE INDEX `Financial_details_uid_key`(`uid`),
    UNIQUE INDEX `Financial_details_userProfileId_key`(`userProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Charger_Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `Chargerserialnum` VARCHAR(191) NULL,
    `ChargerName` VARCHAR(191) NULL,
    `Chargerhost` VARCHAR(191) NULL,
    `Segment` VARCHAR(191) NULL,
    `Subsegment` VARCHAR(191) NULL,
    `Total_Capacity` VARCHAR(191) NULL,
    `Chargertype` VARCHAR(191) NULL,
    `parking` VARCHAR(191) NULL,
    `number_of_connectors` VARCHAR(191) NULL,
    `Connector_type` VARCHAR(191) NULL,
    `connector_total_capacity` VARCHAR(191) NULL,
    `lattitude` VARCHAR(191) NULL,
    `longitute` VARCHAR(191) NULL,
    `full_address` VARCHAR(191) NULL,
    `charger_use_type` VARCHAR(191) NULL,
    `twenty_four_seven_open_status` VARCHAR(191) NULL,
    `charger_image` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Charger_Unit_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssignRoles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `userid` VARCHAR(191) NULL,
    `rolename` VARCHAR(191) NULL,
    `roledesc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AssignRoles_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assigntovechicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `vehiclename` VARCHAR(191) NULL,
    `vehiclemodel` VARCHAR(191) NULL,
    `vehiclelicense` VARCHAR(191) NULL,
    `vehicleowner` VARCHAR(191) NULL,
    `vehiclecategory` VARCHAR(191) NULL,
    `vehicletype` VARCHAR(191) NULL,
    `vehicleowenerId` VARCHAR(191) NULL,
    `isvehicleassigned` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assigntovechicles_uid_key`(`uid`),
    UNIQUE INDEX `Assigntovechicles_vehiclelicense_key`(`vehiclelicense`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assigntovehicleowener` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `vehicleowenerfirstname` VARCHAR(191) NULL,
    `vehicleowenerlastename` VARCHAR(191) NULL,
    `vehicleoweneremail` VARCHAR(191) NULL,
    `phonenumber` VARCHAR(191) NULL,
    `vehicleowenerlicense` VARCHAR(191) NULL,
    `vehicleowenergovdocs` VARCHAR(191) NULL,
    `vehicleowenernationality` VARCHAR(191) NULL,
    `vehicleowenerid` VARCHAR(191) NULL,
    `vehicleoweneraddress` VARCHAR(191) NULL,
    `vehicleowenerrole` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assigntovehicleowener_uid_key`(`uid`),
    UNIQUE INDEX `Assigntovehicleowener_vehicleoweneremail_key`(`vehicleoweneremail`),
    UNIQUE INDEX `Assigntovehicleowener_vehicleowenerlicense_key`(`vehicleowenerlicense`),
    UNIQUE INDEX `Assigntovehicleowener_vehicleowenerid_key`(`vehicleowenerid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RazorpayData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `attempts` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RazorpayData_uid_key`(`uid`),
    UNIQUE INDEX `RazorpayData_orderId_key`(`orderId`),
    UNIQUE INDEX `RazorpayData_paymentId_key`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `totalnumberofusers` VARCHAR(191) NULL,
    `totalnumberofuserprofiles` VARCHAR(191) NULL,
    `perdaynewusercount` VARCHAR(191) NULL,
    `countofroles` VARCHAR(191) NULL,
    `countofchargerunits` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Analytics_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailySignup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `newSignupCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogRetention` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `messagetype` VARCHAR(191) NULL,
    `messages` JSON NULL,
    `filelocation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LogRetention_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QRCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `chargerid` VARCHAR(191) NULL,
    `qrcodedata` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QRCode_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `userprofilerelatedwallet` VARCHAR(191) NULL,
    `appuserrelatedwallet` VARCHAR(191) NULL,
    `balance` VARCHAR(191) NULL,
    `iswalletrechargedone` BOOLEAN NULL,
    `recharger_made_by_which_user` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallet_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `walletreachargehistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `userassociatedid` VARCHAR(191) NULL,
    `previousbalance` VARCHAR(191) NULL,
    `balanceleft` VARCHAR(191) NULL,
    `addedbalance` VARCHAR(191) NULL,
    `numberofrecharge` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `walletreachargehistory_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reateofpayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `setpaymentrate` VARCHAR(191) NULL,
    `tax` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reateofpayment_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AppUserProfile` ADD CONSTRAINT `AppUserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Financial_details` ADD CONSTRAINT `Financial_details_userProfileId_fkey` FOREIGN KEY (`userProfileId`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Charger_Unit` ADD CONSTRAINT `Charger_Unit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_vehicleowenerId_fkey` FOREIGN KEY (`vehicleowenerId`) REFERENCES `Assigntovehicleowener`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRCode` ADD CONSTRAINT `QRCode_chargerid_fkey` FOREIGN KEY (`chargerid`) REFERENCES `Charger_Unit`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_userprofilerelatedwallet_fkey` FOREIGN KEY (`userprofilerelatedwallet`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_appuserrelatedwallet_fkey` FOREIGN KEY (`appuserrelatedwallet`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
