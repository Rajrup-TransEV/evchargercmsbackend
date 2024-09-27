-- AlterTable
ALTER TABLE `Assigntovechicles` ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
