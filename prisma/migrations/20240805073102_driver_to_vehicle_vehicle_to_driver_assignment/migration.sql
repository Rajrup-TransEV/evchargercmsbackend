-- AlterTable
ALTER TABLE `AssigntoDriver` ADD COLUMN `diverid` VARCHAR(191) NULL,
    ADD COLUMN `driveraddress` VARCHAR(191) NULL,
    ADD COLUMN `driveremail` VARCHAR(191) NULL,
    ADD COLUMN `driverfirstname` VARCHAR(191) NULL,
    ADD COLUMN `drivergovdocs` VARCHAR(191) NULL,
    ADD COLUMN `driverlastename` VARCHAR(191) NULL,
    ADD COLUMN `driverlicense` VARCHAR(191) NULL,
    ADD COLUMN `drivernationality` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Assigntovechicles` ADD COLUMN `driverId` VARCHAR(191) NULL,
    ADD COLUMN `vehiclelicense` VARCHAR(191) NULL,
    ADD COLUMN `vehiclemodel` VARCHAR(191) NULL,
    ADD COLUMN `vehiclename` VARCHAR(191) NULL,
    ADD COLUMN `vehicleowner` VARCHAR(191) NULL,
    ADD COLUMN `vehicletype` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `AssigntoDriver`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
