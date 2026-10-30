/*
  Warnings:

  - You are about to drop the column `description` on the `Feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "description",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "title" TEXT;
