/*
  Warnings:

  - You are about to drop the column `iUsed` on the `OTPVerification` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `OTPVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTPVerification" DROP COLUMN "iUsed",
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
