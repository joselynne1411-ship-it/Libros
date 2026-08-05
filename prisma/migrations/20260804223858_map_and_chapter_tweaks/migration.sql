/*
  Warnings:

  - You are about to drop the column `mapImageUrl` on the `Location` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Chapter_bookId_order_key";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "mapImageUrl" TEXT;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "mapImageUrl";
