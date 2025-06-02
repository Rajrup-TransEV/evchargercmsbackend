-- AlterTable
ALTER TABLE `Feedback` ADD COLUMN `isserveytook` BOOLEAN NULL DEFAULT false,
    MODIFY `feedbackmessage` VARCHAR(600) NULL;
