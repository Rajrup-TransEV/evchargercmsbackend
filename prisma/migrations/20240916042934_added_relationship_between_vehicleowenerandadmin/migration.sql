/*
  Warnings:

  - You are about to drop the column `vehicleowenerid` on the `Assigntovehicleowener` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adminid]` on the table `Assigntovehicleowener` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Assigntovehicleowener_vehicleowenerid_key` ON `Assigntovehicleowener`;

-- AlterTable
ALTER TABLE `Assigntovehicleowener` DROP COLUMN `vehicleowenerid`,
    ADD COLUMN `adminid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovehicleowener_adminid_key` ON `Assigntovehicleowener`(`adminid`);

-- AddForeignKey
ALTER TABLE `Assigntovehicleowener` ADD CONSTRAINT `Assigntovehicleowener_adminid_fkey` FOREIGN KEY (`adminid`) REFERENCES `UserProfile`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
