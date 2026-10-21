-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('AIRPORT_PICKUP', 'HOME_DELIVERY');

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'AIRPORT_PICKUP',
ADD COLUMN     "pickupLocation" TEXT,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT;

-- CreateIndex
CREATE INDEX "rentals_fulfillmentType_idx" ON "rentals"("fulfillmentType");
