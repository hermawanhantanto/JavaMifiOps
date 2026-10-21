# JavaMifiRent

JavaMifiRent is an enterprise pocket Wi-Fi rental operations and customer management platform (ERP) designed for international travel connectivity. It integrates hardware asset inventory tracking, customer booking reservations, automated Midtrans Snap payment gateway with BullMQ auto-expiration, end-to-end device fulfillment (airport pickup, home delivery, and return inspection), and an autonomous **n8n AI Concierge & Support Agent**.

---

## 🚀 Key Modules (Exceeds Technical Test 3-Module Minimum)

### 1. Hardware Asset & Inventory Management (`Device`)
- Hardware lifecycle tracking: Serial Number, IMEI, Model, Battery Health, Speed Tier (4G/5G), and Daily Rate.
- Real-time status state machine: `AVAILABLE` $\to$ `BOOKED` $\to$ `RENTED` $\to$ `MAINTENANCE` / `LOST` / `RETIRED`.
- Database-level projections (`buildDeviceSelect`) strictly concealing sensitive hardware identifiers (IMEI, Serial Number) from customer roles.

### 2. Rental & Reservation Lifecycle (`Rental`)
- **Booking Creation**: Authoritative inclusive-day calculation and atomic Compare-and-Swap (CAS) locking.
- **Fulfillment & Logistics**:
  - `AIRPORT_PICKUP`: 24/7 airport counter pickup (CGK T3/T2, DPS, SUB) with 24/7 arrival drop box return.
  - `HOME_DELIVERY`: Pre-departure courier shipment with tracking number and prepaid return polymailer.
  - Non-airport fallback return to JavaMifi Central Return Hub.
- **Dispatch & Inspection**: Admin transitions `CONFIRMED` $\to$ `ACTIVE`, and post-trip return grading (`GOOD`, `DAMAGED`, `LOST`).

### 3. Payment Gateway & Billing (`Payment`)
- **Midtrans Snap hosted checkout**: Generates live sandbox checkout sessions for Virtual Accounts, QRIS, and Credit Cards.
- **Automated Expiration**: 30-minute BullMQ delayed queue on Redis that cancels unpaid bookings and releases reserved devices.
- **Webhook Settlement**: SHA-512 signature verification, database transaction atomicity, and idempotent audit logs (`PaymentWebhookLog`).

### 4. User Profile & Authentication (`Auth`)
- Secure authentication using JWT stored in HTTP-only cookies.
- Role-based access control (`ADMIN` vs `CUSTOMER`).
- Profile management with saved shipping address for re-use on home delivery bookings.

---

## 🤖 Automation: n8n AI Concierge & Support Agent

This project includes a production-ready **n8n AI Agent Workflow** located in:
📁 **[`n8n/javamifi-ai-agent-workflow.json`](n8n/javamifi-ai-agent-workflow.json)**

- **Autonomous Agent**: Connects to LLM (Google Gemini / OpenAI / Groq) with Window Buffer Memory.
- **Live Tool Calling**:
  - `get_available_devices`: Queries live JavaMifi catalog (`GET /api/public/devices`).
  - `track_rental_booking`: Inspects live booking status and logistics (`GET /api/public/rental/track/:code`).
- **Complete Setup & Testing Guide**: See **[`N8N_GUIDE.md`](N8N_GUIDE.md)** for a 2-minute quickstart.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js (v24), Express 5, TypeScript, Prisma ORM 7, BullMQ, Redis, PostgreSQL |
| **Payment Gateway** | Midtrans Snap Sandbox API & Webhook Handler |
| **Automation Engine**| n8n Workflow Automation (LangChain AI Agent, Tools, Memory) |

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Node.js >= 18 (recommended Node 20+)
- Docker (for PostgreSQL & Redis)

### 2. Start Infrastructure (PostgreSQL & Redis)
Ensure PostgreSQL is running on port `5432` and Redis is running on port `6379`.

### 3. Setup & Start Backend
```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```
*Backend API starts on `http://localhost:5000`.*

### 4. Setup & Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend application opens on `http://localhost:3000`.*

### 5. Setup n8n AI Agent (Optional / Evaluator Demo)
```powershell
npx n8n
```
1. Open `http://localhost:5678`.
2. Click **Import from file** $\to$ select `n8n/javamifi-ai-agent-workflow.json`.
3. Add a Gemini or OpenAI API key and start chatting! (See [`N8N_GUIDE.md`](N8N_GUIDE.md) for sample questions).
