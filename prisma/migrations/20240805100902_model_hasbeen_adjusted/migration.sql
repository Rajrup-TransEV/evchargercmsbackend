/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Assigntovechicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `Assigntovechicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Assigntovechicles` ADD COLUMN `status` ENUM('AVAILABLE', 'ASSIGNED', 'BROKEN', 'IN_MAINTENANCE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assigntovechicles_driverId_key` ON `Assigntovechicles`(`driverId`);
