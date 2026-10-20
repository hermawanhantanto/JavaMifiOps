/*
  Warnings:

  - Changed the type of `speed` on the `devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DeviceSpeed" AS ENUM ('SPEED_4G_150MBPS', 'SPEED_4G_300MBPS', 'SPEED_5G_500MBPS', 'SPEED_5G_1GBPS');

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "speed",
ADD COLUMN     "speed" "DeviceSpeed" NOT NULL;
