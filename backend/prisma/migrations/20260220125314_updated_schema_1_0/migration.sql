/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `level` on the `Department` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "level",
ADD COLUMN     "level" "JurisdictionLevel" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
