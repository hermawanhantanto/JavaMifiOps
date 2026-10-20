-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "HardwareStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'LOST', 'RETIRED');

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'RETURNED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('MIDTRANS', 'XENDIT', 'MOCK');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('NO_SIGNAL', 'BATTERY_FAILURE', 'PHYSICAL_DAMAGE', 'LOST_UNIT', 'OTHER');

-- CreateEnum
CREATE TYPE "IssuePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardwareAsset" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "batteryHealth" INTEGER NOT NULL DEFAULT 100,
    "speed" TEXT NOT NULL,
    "dailyRate" DECIMAL(12,2) NOT NULL,
    "status" "HardwareStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HardwareAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rent" (
    "id" TEXT NOT NULL,
    "rentalCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hardwareId" TEXT,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "dailyRate" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "RentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "rentId" TEXT NOT NULL,
    "gatewayRef" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'MIDTRANS',
    "paymentMethod" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "snapToken" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueTicket" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "rentId" TEXT NOT NULL,
    "hardwareId" TEXT,
    "reporterId" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL DEFAULT 'OTHER',
    "priority" "IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareAsset_serialNumber_key" ON "HardwareAsset"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HardwareAsset_imei_key" ON "HardwareAsset"("imei");

-- CreateIndex
CREATE INDEX "HardwareAsset_status_idx" ON "HardwareAsset"("status");

-- CreateIndex
CREATE INDEX "HardwareAsset_model_idx" ON "HardwareAsset"("model");

-- CreateIndex
CREATE UNIQUE INDEX "Rent_rentalCode_key" ON "Rent"("rentalCode");

-- CreateIndex
CREATE INDEX "Rent_userId_idx" ON "Rent"("userId");

-- CreateIndex
CREATE INDEX "Rent_hardwareId_idx" ON "Rent"("hardwareId");

-- CreateIndex
CREATE INDEX "Rent_status_idx" ON "Rent"("status");

-- CreateIndex
CREATE INDEX "Rent_startDate_endDate_idx" ON "Rent"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_gatewayRef_key" ON "Transaction"("gatewayRef");

-- CreateIndex
CREATE INDEX "Transaction_rentId_idx" ON "Transaction"("rentId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_gatewayRef_idx" ON "Transaction"("gatewayRef");

-- CreateIndex
CREATE UNIQUE INDEX "IssueTicket_ticketCode_key" ON "IssueTicket"("ticketCode");

-- CreateIndex
CREATE INDEX "IssueTicket_rentId_idx" ON "IssueTicket"("rentId");

-- CreateIndex
CREATE INDEX "IssueTicket_hardwareId_idx" ON "IssueTicket"("hardwareId");

-- CreateIndex
CREATE INDEX "IssueTicket_reporterId_idx" ON "IssueTicket"("reporterId");

-- CreateIndex
CREATE INDEX "IssueTicket_status_idx" ON "IssueTicket"("status");

-- CreateIndex
CREATE INDEX "IssueTicket_priority_idx" ON "IssueTicket"("priority");

-- AddForeignKey
ALTER TABLE "Rent" ADD CONSTRAINT "Rent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rent" ADD CONSTRAINT "Rent_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "HardwareAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueTicket" ADD CONSTRAINT "IssueTicket_rentId_fkey" FOREIGN KEY ("rentId") REFERENCES "Rent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueTicket" ADD CONSTRAINT "IssueTicket_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "HardwareAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueTicket" ADD CONSTRAINT "IssueTicket_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
