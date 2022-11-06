/*
  Warnings:

  - Added the required column `price` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "price" INTEGER NOT NULL;
