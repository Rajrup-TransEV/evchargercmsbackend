-- DropForeignKey
ALTER TABLE `Addhub` DROP FOREIGN KEY `Addhub_adminuid_fkey`;

-- DropForeignKey
ALTER TABLE `Assigntovechicles` DROP FOREIGN KEY `Assigntovechicles_adminuid_fkey`;

-- DropForeignKey
ALTER TABLE `Assigntovechicles` DROP FOREIGN KEY `Assigntovechicles_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Assigntovechicles` DROP FOREIGN KEY `Assigntovechicles_vehicleowenerId_fkey`;

-- DropForeignKey
ALTER TABLE `Assigntovehicleowener` DROP FOREIGN KEY `Assigntovehicleowener_adminid_fkey`;

-- DropForeignKey
ALTER TABLE `Financial_details` DROP FOREIGN KEY `Financial_details_userProfileId_fkey`;

-- DropForeignKey
ALTER TABLE `QRCode` DROP FOREIGN KEY `QRCode_chargerid_fkey`;

-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `wallet_appuserrelatedwallet_fkey`;

-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `wallet_userprofilerelatedwallet_fkey`;

-- AlterTable
ALTER TABLE `Addhub` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `hubname` VARCHAR(255) NULL,
    MODIFY `hubtariff` VARCHAR(255) NULL,
    MODIFY `hublocation` VARCHAR(255) NULL,
    MODIFY `adminuid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Analytics` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `totalnumberofusers` VARCHAR(255) NULL,
    MODIFY `totalnumberofuserprofiles` VARCHAR(255) NULL,
    MODIFY `perdaynewusercount` VARCHAR(255) NULL,
    MODIFY `countofroles` VARCHAR(255) NULL,
    MODIFY `countofchargerunits` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `AssignRoles` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `userid` VARCHAR(255) NULL,
    MODIFY `rolename` VARCHAR(255) NULL,
    MODIFY `roledesc` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Assigntovechicles` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `vehiclename` VARCHAR(255) NULL,
    MODIFY `vehiclemodel` VARCHAR(255) NULL,
    MODIFY `vehiclelicense` VARCHAR(255) NULL,
    MODIFY `vehicleowner` VARCHAR(255) NULL,
    MODIFY `vehiclecategory` VARCHAR(255) NULL,
    MODIFY `vehicletype` VARCHAR(255) NULL,
    MODIFY `vehicleowenerId` VARCHAR(255) NULL,
    MODIFY `userId` VARCHAR(255) NULL,
    MODIFY `adminuid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Assigntovehicleowener` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `vehicleowenerfirstname` VARCHAR(255) NULL,
    MODIFY `vehicleowenerlastename` VARCHAR(255) NULL,
    MODIFY `vehicleoweneremail` VARCHAR(255) NULL,
    MODIFY `phonenumber` VARCHAR(255) NULL,
    MODIFY `vehicleowenerlicense` VARCHAR(255) NULL,
    MODIFY `vehicleowenergovdocs` VARCHAR(255) NULL,
    MODIFY `vehicleowenernationality` VARCHAR(255) NULL,
    MODIFY `vehicleoweneraddress` VARCHAR(255) NULL,
    MODIFY `vehicleowenerrole` VARCHAR(255) NULL,
    MODIFY `adminid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Bookings` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `chargeruid` VARCHAR(255) NULL,
    MODIFY `useruid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Charger_Unit` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `Chargerserialnum` VARCHAR(255) NULL,
    MODIFY `ChargerName` VARCHAR(255) NULL,
    MODIFY `Chargerhost` VARCHAR(255) NULL,
    MODIFY `Segment` VARCHAR(255) NULL,
    MODIFY `Subsegment` VARCHAR(255) NULL,
    MODIFY `Total_Capacity` VARCHAR(255) NULL,
    MODIFY `Chargertype` VARCHAR(255) NULL,
    MODIFY `parking` VARCHAR(255) NULL,
    MODIFY `number_of_connectors` VARCHAR(255) NULL,
    MODIFY `Connector_type` VARCHAR(255) NULL,
    MODIFY `connector_total_capacity` VARCHAR(255) NULL,
    MODIFY `lattitude` VARCHAR(255) NULL,
    MODIFY `longitute` VARCHAR(255) NULL,
    MODIFY `full_address` VARCHAR(255) NULL,
    MODIFY `charger_use_type` VARCHAR(255) NULL,
    MODIFY `twenty_four_seven_open_status` VARCHAR(255) NULL,
    MODIFY `charger_image` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `DailySignup` MODIFY `uid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `DisputFrom` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `customername` VARCHAR(255) NULL,
    MODIFY `relatedtoev` VARCHAR(255) NULL,
    MODIFY `reason` VARCHAR(255) NULL,
    MODIFY `morethanonecharge` VARCHAR(255) NULL,
    MODIFY `wrongcharged` VARCHAR(255) NULL,
    MODIFY `didnotreceiverefund` VARCHAR(255) NULL,
    MODIFY `paidforothermeans` VARCHAR(255) NULL,
    MODIFY `disputtransaction` VARCHAR(255) NULL,
    MODIFY `chargedregularly` VARCHAR(255) NULL,
    MODIFY `notlistedabove` VARCHAR(255) NULL,
    MODIFY `transactiondetails` VARCHAR(255) NULL,
    MODIFY `disputedetails` VARCHAR(255) NULL,
    MODIFY `associatedadminid` VARCHAR(255) NULL,
    MODIFY `userid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Favorites` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `chargeruid` VARCHAR(255) NULL,
    MODIFY `useruid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Financial_details` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `bank_account_number` VARCHAR(255) NULL,
    MODIFY `isfc_code` VARCHAR(255) NULL,
    MODIFY `bank_name` VARCHAR(255) NULL,
    MODIFY `branch_name` VARCHAR(255) NULL,
    MODIFY `branch_address` VARCHAR(255) NULL,
    MODIFY `userProfileId` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `HelpandSupport` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `name` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `message` VARCHAR(255) NULL,
    MODIFY `phonenumber` VARCHAR(255) NULL,
    MODIFY `adminuid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `LogRetention` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `messagetype` VARCHAR(255) NULL,
    MODIFY `filelocation` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Minimumbalance` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `minbalance` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `QRCode` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `chargerid` VARCHAR(255) NULL,
    MODIFY `qrcodedata` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `RazorpayData` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `orderId` VARCHAR(255) NULL,
    MODIFY `paymentId` VARCHAR(255) NULL,
    MODIFY `amount` VARCHAR(255) NULL,
    MODIFY `currency` VARCHAR(255) NULL,
    MODIFY `status` VARCHAR(255) NULL,
    MODIFY `attempts` VARCHAR(255) NULL,
    MODIFY `method` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `TransactionHistory` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `paymentid` VARCHAR(255) NULL,
    MODIFY `walletid` VARCHAR(255) NULL,
    MODIFY `userid` VARCHAR(255) NULL,
    MODIFY `price` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `Transactionsdetails` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `paymentid` VARCHAR(255) NULL,
    MODIFY `walletid` VARCHAR(255) NULL,
    MODIFY `userid` VARCHAR(255) NULL,
    MODIFY `price` VARCHAR(255) NULL,
    MODIFY `chargeruid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `username` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `userType` VARCHAR(255) NULL,
    MODIFY `otp` VARCHAR(255) NULL,
    MODIFY `phonenumber` VARCHAR(255) NULL,
    MODIFY `profilepicture` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `UserProfile` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `firstname` VARCHAR(255) NULL,
    MODIFY `lastname` VARCHAR(255) NULL,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `password` VARCHAR(255) NULL,
    MODIFY `address` VARCHAR(255) NULL,
    MODIFY `phonenumber` VARCHAR(255) NULL,
    MODIFY `role` VARCHAR(255) NULL,
    MODIFY `designation` VARCHAR(255) NULL,
    MODIFY `otp` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `iptracker` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `datetimeofaccess` VARCHAR(255) NULL,
    MODIFY `filepath` VARCHAR(255) NULL,
    MODIFY `ipaddress` VARCHAR(255) NULL,
    MODIFY `messages` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `wallet` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `userprofilerelatedwallet` VARCHAR(255) NULL,
    MODIFY `appuserrelatedwallet` VARCHAR(255) NULL,
    MODIFY `balance` VARCHAR(255) NULL,
    MODIFY `recharger_made_by_which_user` VARCHAR(255) NULL,
    MODIFY `associatedadminuid` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `walletreachargehistory` MODIFY `uid` VARCHAR(255) NULL,
    MODIFY `userassociatedid` VARCHAR(255) NULL,
    MODIFY `previousbalance` VARCHAR(255) NULL,
    MODIFY `balanceleft` VARCHAR(255) NULL,
    MODIFY `addedbalance` VARCHAR(255) NULL,
    MODIFY `numberofrecharge` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `Financial_details` ADD CONSTRAINT `Financial_details_userProfileId_fkey` FOREIGN KEY (`userProfileId`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_vehicleowenerId_fkey` FOREIGN KEY (`vehicleowenerId`) REFERENCES `Assigntovehicleowener`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_adminuid_fkey` FOREIGN KEY (`adminuid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assigntovehicleowener` ADD CONSTRAINT `Assigntovehicleowener_adminid_fkey` FOREIGN KEY (`adminid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRCode` ADD CONSTRAINT `QRCode_chargerid_fkey` FOREIGN KEY (`chargerid`) REFERENCES `Charger_Unit`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_userprofilerelatedwallet_fkey` FOREIGN KEY (`userprofilerelatedwallet`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `wallet_appuserrelatedwallet_fkey` FOREIGN KEY (`appuserrelatedwallet`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Addhub` ADD CONSTRAINT `Addhub_adminuid_fkey` FOREIGN KEY (`adminuid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
