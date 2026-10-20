# JavaMifi Ops 📶⚡

JavaMifi Ops is a lightweight mini-ERP designed for pocket Wi-Fi rental operations. It unifies inventory asset tracking, customer rental booking, payment gateway reconciliation, device issue tracking, and automated n8n workflow notifications to Telegram.

## 🚀 Key Modules
1. **Inventory Management**: Hardware asset monitoring (IMEI/Serial, Battery Health, Daily Rate, Statuses: `Available`, `Rented`, `Maintenance`, `Lost`).
2. **Rental & Booking**: Order creation, date-range pricing calculation, unit assignment, and payment gateway integration (Midtrans/Xendit webhook simulation).
3. **Issue Tracker & Maintenance**: Incident reporting for active rentals with automated unit status updating to `Maintenance`.
4. **Operations Monitoring Dashboard**: Real-time metrics on fleet utilization, active rentals, pending payments, and open tickets.
5. **n8n Workflow Automation**: Event-driven webhooks and cron triggers dispatching real-time Telegram alerts for new issues, escalations, payment successes, return reminders, and daily executive summaries.

## 📋 Documentation
- [PRD.md](PRD.md) - Product Requirements Document

## 🏗️ Architecture
- `backend/` - API Services & Webhook Engine
- `frontend/` - Mini-ERP Operational Dashboard & Customer Portal
