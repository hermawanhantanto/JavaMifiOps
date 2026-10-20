-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'LOST', 'RETIRED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('NO_SIGNAL', 'BATTERY_FAILURE', 'PHYSICAL_DAMAGE', 'LOST_UNIT', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "IssueTicket" DROP CONSTRAINT IF EXISTS "IssueTicket_hardwareId_fkey";
ALTER TABLE "IssueTicket" DROP CONSTRAINT IF EXISTS "IssueTicket_rentId_fkey";
ALTER TABLE "IssueTicket" DROP CONSTRAINT IF EXISTS "IssueTicket_reporterId_fkey";
ALTER TABLE "Rent" DROP CONSTRAINT IF EXISTS "Rent_hardwareId_fkey";
ALTER TABLE "Rent" DROP CONSTRAINT IF EXISTS "Rent_userId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_rentId_fkey";

-- DropTable
DROP TABLE IF EXISTS "HardwareAsset";
DROP TABLE IF EXISTS "IssueTicket";
DROP TABLE IF EXISTS "Rent";
DROP TABLE IF EXISTS "Transaction";

-- Rename User to users (preserving all existing user rows)
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";
ALTER INDEX IF EXISTS "User_email_key" RENAME TO "users_email_key";
ALTER INDEX IF EXISTS "User_role_idx" RENAME TO "users_role_idx";

-- DropEnum
DROP TYPE IF EXISTS "HardwareStatus";
DROP TYPE IF EXISTS "IssueCategory";
DROP TYPE IF EXISTS "IssuePriority";
DROP TYPE IF EXISTS "IssueStatus";
DROP TYPE IF EXISTS "RentStatus";
DROP TYPE IF EXISTS "TransactionStatus";

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "batteryHealth" INTEGER NOT NULL DEFAULT 100,
    "speed" TEXT NOT NULL,
    "dailyRate" DECIMAL(12,2) NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "rentalCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "dailyRate" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "gatewayRef" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'MIDTRANS',
    "paymentMethod" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "snapToken" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "deviceId" TEXT,
    "reporterId" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'OTHER',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_serialNumber_key" ON "devices"("serialNumber");
CREATE UNIQUE INDEX "devices_imei_key" ON "devices"("imei");
CREATE INDEX "devices_status_idx" ON "devices"("status");
CREATE INDEX "devices_model_idx" ON "devices"("model");

-- CreateIndex
CREATE UNIQUE INDEX "rentals_rentalCode_key" ON "rentals"("rentalCode");
CREATE INDEX "rentals_userId_idx" ON "rentals"("userId");
CREATE INDEX "rentals_deviceId_idx" ON "rentals"("deviceId");
CREATE INDEX "rentals_status_idx" ON "rentals"("status");
CREATE INDEX "rentals_startDate_endDate_idx" ON "rentals"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayRef_key" ON "payments"("gatewayRef");
CREATE INDEX "payments_rentalId_idx" ON "payments"("rentalId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_gatewayRef_idx" ON "payments"("gatewayRef");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketCode_key" ON "tickets"("ticketCode");
CREATE INDEX "tickets_rentalId_idx" ON "tickets"("rentalId");
CREATE INDEX "tickets_deviceId_idx" ON "tickets"("deviceId");
CREATE INDEX "tickets_reporterId_idx" ON "tickets"("reporterId");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
