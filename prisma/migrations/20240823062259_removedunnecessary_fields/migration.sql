/*
  Warnings:

  - You are about to drop the column `apiaccessforbiddencound` on the `Analytics` table. All the data in the column will be lost.
  - You are about to drop the column `numberofnewusers` on the `Analytics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Analytics` DROP COLUMN `apiaccessforbiddencound`,
    DROP COLUMN `numberofnewusers`;
