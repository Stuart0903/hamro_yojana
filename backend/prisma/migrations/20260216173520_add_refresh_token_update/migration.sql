/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `refreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "refreshToken_token_key" ON "refreshToken"("token");
