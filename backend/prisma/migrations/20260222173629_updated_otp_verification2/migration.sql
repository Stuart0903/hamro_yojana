/*
  Warnings:

  - You are about to drop the column `userId` on the `OTPVerification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OTPVerification" DROP CONSTRAINT "OTPVerification_userId_fkey";

-- DropIndex
DROP INDEX "OTPVerification_userId_idx";

-- AlterTable
ALTER TABLE "OTPVerification" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "OTPVerification_phoneNumber_purpose_idx" ON "OTPVerification"("phoneNumber", "purpose");
