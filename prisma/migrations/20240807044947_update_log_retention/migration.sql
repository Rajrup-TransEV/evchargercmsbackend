/*
  Warnings:

  - You are about to drop the column `errormessages` on the `LogRetention` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LogRetention` DROP COLUMN `errormessages`,
    ADD COLUMN `messages` JSON NULL;
