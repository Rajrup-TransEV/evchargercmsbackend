/*
  Warnings:

  - A unique constraint covering the columns `[vehiclevin]` on the table `Assigntovechicles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Assigntovechicles` ADD COLUMN `vehiclebatterycapacity` VARCHAR(191) NULL DEFAULT '0',
    ADD COLUMN `vehiclerange` VARCHAR(191) NULL DEFAULT '0',
    ADD COLUMN `vehiclevin` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovechicles_vehiclevin_key` ON `Assigntovechicles`(`vehiclevin`);
