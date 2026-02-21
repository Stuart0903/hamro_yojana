/*
  Warnings:

  - You are about to drop the column `level` on the `Department` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DOCUMENT', 'IMAGE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'DISBURSED');

-- CreateEnum
CREATE TYPE "SchemeCategory" AS ENUM ('EDUCATION', 'HEALTH', 'AGRICULTURE', 'WOMEN', 'YOUTH', 'DISABILITY');

-- CreateEnum
CREATE TYPE "SchemeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUSPENDED', 'CLOSED');

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "level",
ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Scheme" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT,
    "category" "SchemeCategory" NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "status" "SchemeStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "eligibilityCriteria" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "incomeLimit" DOUBLE PRECISION,
    "maxBeneficiaries" INTEGER,
    "maxApplications" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "provinceId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeRequirement" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "RequirementType" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "provinceId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DOUBLE PRECISION,
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,
    "documentUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scheme_status_idx" ON "Scheme"("status");

-- CreateIndex
CREATE INDEX "Scheme_category_idx" ON "Scheme"("category");

-- CreateIndex
CREATE INDEX "SchemeRequirement_schemeId_idx" ON "SchemeRequirement"("schemeId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");

-- CreateIndex
CREATE INDEX "Application_schemeId_idx" ON "Application"("schemeId");

-- CreateIndex
CREATE INDEX "ApplicationAnswer_applicationId_idx" ON "ApplicationAnswer"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationAnswer_requirementId_idx" ON "ApplicationAnswer"("requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- AddForeignKey
ALTER TABLE "Scheme" ADD CONSTRAINT "Scheme_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "OfficeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeRequirement" ADD CONSTRAINT "SchemeRequirement_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "CitizenProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "OfficeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAnswer" ADD CONSTRAINT "ApplicationAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAnswer" ADD CONSTRAINT "ApplicationAnswer_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "SchemeRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAnswer" ADD CONSTRAINT "ApplicationAnswer_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "OfficeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
