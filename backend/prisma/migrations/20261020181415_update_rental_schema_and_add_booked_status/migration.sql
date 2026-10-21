/*
  Warnings:

  - You are about to drop the column `dailyRate` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `depositAmount` on the `rentals` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "DeviceStatus" ADD VALUE 'BOOKED';

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "dailyRate",
DROP COLUMN "depositAmount",
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "rentals_expiresAt_idx" ON "rentals"("expiresAt");
