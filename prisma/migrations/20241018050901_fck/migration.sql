/*
  Warnings:

  - You are about to alter the column `messagestatus` on the `HelpandSupport` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `HelpandSupport` MODIFY `messagestatus` BOOLEAN NULL DEFAULT true;
