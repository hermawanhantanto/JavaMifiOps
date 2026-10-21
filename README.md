# JavaMifiRent 📶⚡

JavaMifiRent is a modern, lightweight rental operations platform and customer portal designed for international travel pocket Wi-Fi rentals. It unifies inventory hardware tracking, customer booking reservations, automated Midtrans Snap payments with delayed BullMQ auto-expiration, end-to-end device fulfillment (dispatch and check-in inspection), overdue tracking, and automated n8n workflow notifications to Telegram.

## 🚀 Key Modules

1. **Inventory & Asset Management**:
   - Hardware asset monitoring (Serial Number, IMEI, Model, Battery Health, Speed Tier, Daily Rate).
   - Real-time status transitions: `AVAILABLE`, `BOOKED`, `RENTED`, `MAINTENANCE`, `LOST`, `RETIRED`.
   - Strict database-level role projections ensuring sensitive hardware identifiers (IMEI, Serial Number) are never exposed to customers.

2. **Rental & Booking Lifecycle**:
   - **Booking Creation**: Authoritative server-side inclusive-day pricing calculation and Compare-and-Swap (CAS) locking (`AVAILABLE` -> `BOOKED`).
   - **Payment Integration**: Midtrans Snap hosted checkout (QRIS, Virtual Account, Credit Card) with 30-minute payment countdown.
   - **Automated Expiration**: BullMQ delayed queue on Redis for exact-second booking expiration and automatic device release upon payment timeout.
   - **Modifications & Cancellations**: Pre-payment destination/date updates (`PATCH /api/rental/:id`) and customer/admin cancellations (`POST /api/rental/:id/cancel`).
   - **Webhook Settlement**: SHA-512 signature verification, database transaction atomicity, and idempotent audit logs (`PaymentWebhookLog`).
   - **Fulfillment & Dispatch**: Airport counter/courier device handover (`CONFIRMED` -> `ACTIVE`, device `BOOKED` -> `RENTED`).
   - **Return & Inspection**: Post-trip device check-in (`ACTIVE` -> `RETURNED`) with condition grading (`AVAILABLE`, `MAINTENANCE`, `LOST`) and battery health telemetry.
   - **Overdue Tracking**: Automated detection and flagging for units not returned by their scheduled end date.

3. **Operations & Fleet Monitoring Dashboard**:
   - Real-time fleet utilization metrics (Available vs. Booked vs. Rented vs. Maintenance).
   - Order pipeline visibility (pending payments, confirmed trips, active rentals, overdue units).
   - Role-scoped table with multi-field search (rental code, user name, device model, destination) and status filtering.

4. **n8n Workflow Automation**:
   - Event-driven webhooks and cron triggers dispatching real-time Telegram alerts for payment settlements, device dispatches, return reminders, overdue alerts, and daily operational digests.

## 📋 Documentation
- [PRD.md](PRD.md) - Product Requirements Document

## 🏗️ Architecture
- `backend/` - Express 5, TypeScript, Prisma ORM 7, PostgreSQL, Redis (BullMQ), Midtrans Snap
- `frontend/` - React 19, Vite, Tailwind CSS v4, TanStack Query, Radix UI / Shadcn
