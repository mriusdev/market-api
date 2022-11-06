/*
  Warnings:

  - A unique constraint covering the columns `[iconClass]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "iconClass" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_iconClass_key" ON "categories"("iconClass");
