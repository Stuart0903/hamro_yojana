-- AlterTable
ALTER TABLE "OTPVerification" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purpose" TEXT;
