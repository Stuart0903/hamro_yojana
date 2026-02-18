/*
  Warnings:

  - A unique constraint covering the columns `[name,provinceId]` on the table `District` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,districtId]` on the table `Municipality` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wardNumber,municipalityId]` on the table `Ward` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "District_name_provinceId_key" ON "District"("name", "provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_name_districtId_key" ON "Municipality"("name", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_wardNumber_municipalityId_key" ON "Ward"("wardNumber", "municipalityId");
