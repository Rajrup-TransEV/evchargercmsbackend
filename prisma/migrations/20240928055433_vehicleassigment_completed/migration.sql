-- AlterTable
ALTER TABLE `Assigntovechicles` ADD COLUMN `adminuid` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_adminuid_fkey` FOREIGN KEY (`adminuid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
