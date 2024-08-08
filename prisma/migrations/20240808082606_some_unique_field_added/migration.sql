/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phonenumber]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `UserProfile_email_key` ON `UserProfile`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `UserProfile_phonenumber_key` ON `UserProfile`(`phonenumber`);
