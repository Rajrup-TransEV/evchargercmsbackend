/*
  Warnings:

  - You are about to drop the column `driverId` on the `Assigntovechicles` table. All the data in the column will be lost.
  - You are about to drop the `AssigntoDriver` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[vehicleowenerId]` on the table `Assigntovechicles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Assigntovechicles` DROP FOREIGN KEY `Assigntovechicles_driverId_fkey`;

-- AlterTable
ALTER TABLE `Assigntovechicles` DROP COLUMN `driverId`,
    ADD COLUMN `vehicleowenerId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `AssigntoDriver`;

-- CreateTable
CREATE TABLE `Assigntovehicleowener` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(191) NULL,
    `vehicleowenerfirstname` VARCHAR(191) NULL,
    `vehicleowenerlastename` VARCHAR(191) NULL,
    `vehicleoweneremail` VARCHAR(191) NULL,
    `vehicleowenerlicense` VARCHAR(191) NULL,
    `vehicleowenergovdocs` VARCHAR(191) NULL,
    `vehicleowenernationality` VARCHAR(191) NULL,
    `vehicleowenerid` VARCHAR(191) NULL,
    `vehicleoweneraddress` VARCHAR(191) NULL,
    `vehicleowenerrole` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assigntovehicleowener_uid_key`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovechicles_vehicleowenerId_key` ON `Assigntovechicles`(`vehicleowenerId`);

-- AddForeignKey
ALTER TABLE `Assigntovechicles` ADD CONSTRAINT `Assigntovechicles_vehicleowenerId_fkey` FOREIGN KEY (`vehicleowenerId`) REFERENCES `Assigntovehicleowener`(`uid`) ON DELETE SET NULL ON UPDATE CASCADE;
