# Problem
Managing pocket Wi-Fi rentals involves fragmented workflows across hardware inventory readiness, customer booking lifecycles, payment reconciliation, and post-trip return inspections; without an integrated system, operations suffer from double-booking conflicts, orphaned inventory reservations, uncollected returns, and lack of real-time operational visibility across team communication channels.

# Solution
JavaMifiRent is a centralized, lightweight rental operations platform and customer portal designed for international travel pocket Wi-Fi rentals. It unifies inventory asset fleet tracking, atomic compare-and-swap booking reservation, automated payment gateway integration (Midtrans Snap) with BullMQ delayed auto-expiration, end-to-end device fulfillment (dispatch and return check-in inspection), overdue monitoring, and event-driven n8n workflow integration dispatching automated Telegram alerts.

# Features
1. **Inventory & Asset Management Module**: Manages pocket Wi-Fi hardware assets with authoritative hardware specifications (Serial Number, IMEI, Model, Battery Health, Speed Tier, Daily Rate) and real-time status transitions (`AVAILABLE`, `BOOKED`, `RENTED`, `MAINTENANCE`, `LOST`, `RETIRED`) with database-level role projections guarding sensitive identifiers from customers.
2. **Rental & Booking Lifecycle Module**:
   - Customer rental booking creation with server-authoritative inclusive-day duration and total amount computation.
   - Midtrans Snap hosted checkout integration (QRIS, Bank Virtual Accounts, Credit Cards) with 30-minute payment countdown.
   - Exact-second booking auto-expiration and device release powered by BullMQ delayed queues on Redis.
   - Pre-payment rental modifications (`PATCH /api/rental/:id`) and booking cancellations (`POST /api/rental/:id/cancel`) with gateway reconciliation.
   - Midtrans webhook ingestion with SHA-512 signature verification, database transaction atomicity, and idempotent audit logs (`PaymentWebhookLog`).
   - Device dispatch and airport/booth handover (`CONFIRMED` -> `ACTIVE`, device `BOOKED` -> `RENTED`).
   - Device return and check-in inspection (`ACTIVE` / `OVERDUE` -> `RETURNED`) with condition grading (`AVAILABLE`, `MAINTENANCE`, `LOST`) and battery health telemetry.
   - Overdue monitoring and flagging for units not returned by scheduled end dates.
3. **Operations & Fleet Monitoring Dashboard**: Provides ops staff and administrators with real-time fleet utilization metrics (Available vs. Booked vs. Rented vs. Maintenance), active rental orders, revenue tracking, pending payment queues, and role-scoped rental search (rental code, customer name, device model, destination).
4. **Workflow & Notification Automation (n8n & Telegram)**: Emits event-driven webhooks and scheduled cron triggers to an n8n workflow pipeline that sends real-time Telegram notifications for: (a) payment confirmations, (b) device dispatches and pickups, (c) return reminders for active rentals, (d) overdue return alerts, and (e) daily operational summary digests.
