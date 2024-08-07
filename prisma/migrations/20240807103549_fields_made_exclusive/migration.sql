/*
  Warnings:

  - A unique constraint covering the columns `[vehiclelicense]` on the table `Assigntovechicles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleoweneremail]` on the table `Assigntovehicleowener` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleowenerlicense]` on the table `Assigntovehicleowener` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleowenerid]` on the table `Assigntovehicleowener` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Assigntovechicles_vehiclelicense_key` ON `Assigntovechicles`(`vehiclelicense`);

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovehicleowener_vehicleoweneremail_key` ON `Assigntovehicleowener`(`vehicleoweneremail`);

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovehicleowener_vehicleowenerlicense_key` ON `Assigntovehicleowener`(`vehicleowenerlicense`);

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovehicleowener_vehicleowenerid_key` ON `Assigntovehicleowener`(`vehicleowenerid`);
