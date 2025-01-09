/*
  Warnings:

  - You are about to alter the column `crlvEmDia` on the `inspection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - You are about to alter the column `certificadoTacografoEmDia` on the `inspection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `inspection` MODIFY `crlvEmDia` BOOLEAN NULL,
    MODIFY `certificadoTacografoEmDia` BOOLEAN NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account`(`provider`, `providerAccountId`);
