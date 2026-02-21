/*
  Warnings:

  - You are about to drop the column `district` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `municipality` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `Address` table. All the data in the column will be lost.
  - Added the required column `districtID` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipalityID` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinceID` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wardID` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JurisdictionLevel" AS ENUM ('NATIONAL', 'PROVINCE', 'DISTRICT', 'MUNICIPALITY', 'WARD');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPER_ADMIN', 'MINISTRY_OFFICER', 'PROVINCE_OFFICER', 'DISTRICT_OFFICER', 'MUNICIPALITY_OFFICER', 'WARD_OFFICER', 'CITIZEN');

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "district",
DROP COLUMN "municipality",
DROP COLUMN "province",
DROP COLUMN "ward",
ADD COLUMN     "districtID" TEXT NOT NULL,
ADD COLUMN     "municipalityID" TEXT NOT NULL,
ADD COLUMN     "provinceID" TEXT NOT NULL,
ADD COLUMN     "wardID" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "OfficeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "jurisdictionLevel" "JurisdictionLevel" NOT NULL,
    "provinceId" TEXT,
    "districtId" TEXT,
    "municipalityId" TEXT,
    "wardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeProfile_userId_key" ON "OfficeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeProfile" ADD CONSTRAINT "OfficeProfile_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_provinceID_fkey" FOREIGN KEY ("provinceID") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_districtID_fkey" FOREIGN KEY ("districtID") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_municipalityID_fkey" FOREIGN KEY ("municipalityID") REFERENCES "Municipality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_wardID_fkey" FOREIGN KEY ("wardID") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
