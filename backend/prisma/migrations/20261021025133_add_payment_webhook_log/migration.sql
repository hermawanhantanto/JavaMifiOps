-- CreateTable
CREATE TABLE "payment_webhook_logs" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT,
    "transactionStatus" TEXT,
    "fraudStatus" TEXT,
    "statusCode" TEXT,
    "grossAmount" DECIMAL(12,2),
    "signatureKey" TEXT,
    "isSignatureValid" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_webhook_logs_orderId_idx" ON "payment_webhook_logs"("orderId");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_transactionId_idx" ON "payment_webhook_logs"("transactionId");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_paymentId_idx" ON "payment_webhook_logs"("paymentId");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_isProcessed_idx" ON "payment_webhook_logs"("isProcessed");

-- AddForeignKey
ALTER TABLE "payment_webhook_logs" ADD CONSTRAINT "payment_webhook_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
