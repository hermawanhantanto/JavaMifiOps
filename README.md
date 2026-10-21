# JavaMifiRent - Sistem ERP Operasional Penyewaan Pocket Wi-Fi Internasional

JavaMifiRent adalah aplikasi web berbasis Enterprise Resource Planning (ERP) yang dirancang untuk mengelola operasional penyewaan perangkat keras Pocket Wi-Fi bagi pelaku perjalanan internasional. Sistem ini mengintegrasikan manajemen aset perangkat keras, reservasi pelanggan dengan penguncian stok atomik, pembayaran otomatis melalui Midtrans Snap Sandbox, antrean pembatalan otomatis berbasis Redis (BullMQ), manajemen logistik pengambilan/pengembalian perangkat, serta otomasi layanan pelanggan menggunakan n8n AI Agent yang terhubung ke Telegram Bot.

---

## Pemenuhan Spesifikasi Technical Test

| Kriteria Penilaian | Implementasi pada JavaMifiRent |
| :--- | :--- |
| **Tema Aplikasi (ERP)** | Sistem ERP terpusat untuk manajemen inventaris perangkat keras (IMEI, Serial Number, kesehatan baterai), siklus penyewaan, pemantauan keterlambatan (overdue), dan rekonsiliasi keuangan. |
| **Minimal 3 Modul Utama** | Memiliki 5 modul utama yang berfungsi penuh: (1) Modul Inventaris Perangkat (`Device`), (2) Modul Siklus Penyewaan & Logistik (`Rental`), (3) Modul Pembayaran & Audit Webhook (`Payment`), (4) Modul Autentikasi & RBAC (`Auth`), dan (5) Modul Integrasi Publik & Otomasi AI (`Public`). |
| **API Connection** | Integrasi RESTful API antara React Frontend dan Express Backend, komunikasi server-ke-server dengan Midtrans Snap REST API, serta pemanggilan endpoint internal secara dinamis oleh n8n Cloud melalui HTTP Tool Calling. |
| **Payment Gateway** | Integrasi penuh dengan **Midtrans Snap (Sandbox)** untuk pembayaran Virtual Account, QRIS, dan Kartu Kredit, dilengkapi penerima webhook asinkron (`POST /api/payment/notification`) dengan validasi tanda tangan kriptografi SHA-512. |
| **Automation Tools (n8n)** | Workflow **n8n AI Concierge & ERP Support Agent** (`n8n/javamifi-ai-agent-workflow.json`) yang terintegrasi dengan **Telegram Bot** dan Google Gemini untuk pengecekan stok real-time, pelacakan pesanan, pemulihan tautan pembayaran Midtrans, perubahan lokasi pengambilan, dan pembatalan pesanan mandiri. |
| **Frontend Modern** | Dibangun menggunakan **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **TanStack React Query**. |
| **Backend Non-Firebase** | Dibangun menggunakan **Node.js**, **Express 5**, **TypeScript**, **PostgreSQL**, **Prisma ORM 7**, serta **Redis & BullMQ**. |

---

## Arsitektur Sistem & Desain Teknis

### 1. Diagram Arsitektur

```mermaid
flowchart TB
    subgraph Client_Layer [Lapisan Klien]
        Web[React 19 SPA - Customer & Admin Portal]
        TG[Aplikasi Telegram - Pelanggan]
    end

    subgraph Automation_Layer [Lapisan Otomasi - n8n Cloud]
        n8n[n8n AI Agent Workflow]
        LLM[Google Gemini LLM + Memori Terisolasi per Chat ID]
        n8n <--> LLM
    end

    subgraph Backend_Layer [Lapisan Backend - Node.js & Express 5]
        API[REST API Controller & Middleware]
        AuthMod[Modul Auth & JWT RBAC]
        DeviceMod[Modul Inventaris Device]
        RentalMod[Modul Siklus Rental & Logistik]
        PaymentMod[Modul Payment & Webhook Handler]
        PublicMod[Modul Integrasi Publik & Support]
        Worker[BullMQ Delayed Expiration Worker]
    end

    subgraph Data_And_External [Infrastruktur Data & Pihak Ketiga]
        PG[(PostgreSQL Database)]
        Redis[(Redis Queue Store)]
        Midtrans[Midtrans Snap Payment Gateway]
    end

    Web <-->|REST API + HTTP-Only Cookie| API
    TG <-->|Webhook Pesan| n8n
    n8n <-->|HTTP Request Tools| PublicMod
    API --> AuthMod
    API --> DeviceMod
    API --> RentalMod
    API --> PaymentMod
    API --> PublicMod
    RentalMod <-->|Buat Transaksi & Pembatalan| Midtrans
    Midtrans -->|Webhook Notifikasi SHA-512| PaymentMod
    RentalMod -->|Jadwalkan Kedaluwarsa 30 Menit| Redis
    Redis <--> Worker
    Worker -->|Batalkan Pesanan Kedaluwarsa| PG
    AuthMod & DeviceMod & RentalMod & PaymentMod & PublicMod --> PG
```

### 2. Prinsip Arsitektur Backend
- **Modular Layered Architecture (Feature-Based)**: Setiap domain bisnis diisolasi ke dalam direktori `src/features/<modul>/` dengan pemisahan tanggung jawab yang tegas:
  - `<modul>.route.ts`: Definisi endpoint HTTP dan pemasangan middleware otorisasi.
  - `<modul>.handler.ts`: Pengendali HTTP yang menerima request, menjalankan validasi skema, memanggil service, dan mengembalikan respons terstandarisasi.
  - `<modul>.validator.ts`: Validasi input runtime menggunakan skema **Zod**.
  - `<modul>.service.ts`: Logika bisnis inti dan manajemen transaksi database.
  - `<modul>.helper.ts`: Pembuatan objek filter query dan proyeksi kolom database (`select`).
  - `<modul>.dto.ts`: Kontrak tipe data TypeScript (Data Transfer Objects) untuk input dan output antar lapisan.
- **Standarisasi Amplop Respons HTTP**: Seluruh endpoint mengembalikan struktur JSON yang seragam (`{ status: "success" | "error", message: string, data: T | null }`) melalui helper terpusat pada `src/common/response.ts`.
- **Pencegahan Race Condition (Compare-and-Swap & Transaksi ACID)**: Saat pelanggan memesan perangkat, status perangkat dikunci secara atomik dari `AVAILABLE` menjadi `BOOKED` di dalam transaksi database (`prisma.$transaction`). Jika dua pengguna memesan perangkat yang sama pada milidetik yang bersamaan, hanya satu transaksi yang berhasil sementara permintaan lainnya ditolak secara aman (`409 Conflict`).
- **Proyeksi Keamanan Tingkat Database**: Identitas sensitif perangkat keras (`imei` dan `serialNumber`) disembunyikan dari peran `CUSTOMER` dan endpoint publik langsung pada level query PostgreSQL melalui proyeksi Prisma `select`, bukan difilter di memori aplikasi.

### 3. Prinsip Arsitektur Frontend
- **Single-Purpose Atomic Components**: Setiap komponen antarmuka memiliki satu tanggung jawab spesifik (misalnya komponen tabel, baris tabel, filter status, input pencarian dengan debounce, dan dialog aksi terpisah).
- **Manajemen Server-State Terpusat**: Menggunakan **TanStack React Query** untuk sinkronisasi data, caching, invalidasi otomatis setelah mutasi, serta pemisahan tampilan berdasarkan peran pengguna (`ADMIN` vs `CUSTOMER`).

---

## Pembagian Modul Utama

### 1. Modul Manajemen Inventaris & Aset (`Device`)
Mengelola siklus hidup armada perangkat keras Pocket Wi-Fi secara menyeluruh:
- Pencatatan spesifikasi teknis perangkat: Nomor Seri (`serialNumber`), `imei`, nama model, persentase kesehatan baterai (`batteryHealth`), kategori kecepatan (`4G 150Mbps`, `4G 300Mbps`, `5G 500Mbps`, `5G 1Gbps`), serta tarif sewa harian (`dailyRate`).
- Transisi status perangkat secara ketat: `AVAILABLE`, `BOOKED`, `RENTED`, `MAINTENANCE`, `LOST`, dan `RETIRED`.
- Pencarian perangkat dengan mekanisme debounce serta penyaringan berdasarkan status dan kategori kecepatan.

### 2. Modul Siklus Penyewaan & Logistik (`Rental`)
Mengatur proses bisnis penyewaan dari pemesanan hingga pengembalian pasca-perjalanan:
- **Kalkulasi Durasi & Tarif Otoritatif**: Perhitungan jumlah hari sewa (inklusif) dan total biaya dilakukan sepenuhnya di sisi server untuk mencegah manipulasi harga dari sisi klien.
- **Manajemen Metode Penyerahan (`FulfillmentType`)**: Mendukung pengambilan di konter bandara 24/7 (`AIRPORT_PICKUP` di CGK T2/T3, DPS, SUB) maupun pengiriman kurir ke alamat rumah (`HOME_DELIVERY`) beserta pencatatan nomor resi (`trackingNumber`).
- **Penyerahan & Inspeksi Pengembalian Perangkat**: Administrator dapat mencatat penyerahan perangkat (`CONFIRMED` ke `ACTIVE`) serta memproses inspeksi kondisi fisik perangkat saat dikembalikan (`GOOD` kembali ke `AVAILABLE`, `DAMAGED` masuk ke `MAINTENANCE`, atau `LOST`).
- **Kedaluwarsa Otomatis 30 Menit (BullMQ & Redis)**: Setiap pesanan berstatus `PENDING_PAYMENT` dijadwalkan pada antrean tertunda BullMQ. Jika pembayaran tidak diselesaikan dalam 30 menit, worker secara otomatis membatalkan pesanan dan mengembalikan status perangkat menjadi `AVAILABLE`.

### 3. Modul Pembayaran & Rekonsiliasi Webhook (`Payment`)
Mengelola transaksi pembayaran digital secara aman dan idempoten:
- **Pembuatan Sesi Midtrans Snap**: Menghasilkan `snapToken` dan `redirectUrl` sebelum mengunci perangkat di database sehingga kegagalan jaringan ke pihak ketiga tidak pernah meninggalkan data menggantung.
- **Penanganan Webhook Cepat & Asinkron (`POST /api/payment/notification`)**:
  1. Memverifikasi tanda tangan kriptografi `SHA-512(order_id + status_code + gross_amount + ServerKey)`.
  2. Mencatat payload mentah ke tabel audit `payment_webhook_logs` dan langsung mengembalikan respons `200 OK` ke Midtrans agar tidak terjadi timeout.
  3. Memproses perubahan status pembayaran (`PAID`, `EXPIRED`, `FAILED`), memperbarui status penyewaan menjadi `CONFIRMED`, serta membatalkan timer kedaluwarsa BullMQ secara asinkron di latar belakang.

### 4. Modul Autentikasi & Kontrol Akses (`Auth`)
- Autentikasi berbasis JSON Web Token (JWT) yang disimpan di dalam `HTTP-Only Cookie` untuk mencegah serangan XSS.
- Pengaturan hak akses berbasis peran (`Role-Based Access Control`) antara `ADMIN` (operasional penuh) dan `CUSTOMER` (pemesanan dan pelacakan mandiri).
- Penyimpanan alamat pengiriman pelanggan untuk mempercepat pemesanan berikutnya.

### 5. Modul Otomasi Layanan Pelanggan AI (`Public` & `n8n`)
Menghubungkan platform ERP dengan workflow **n8n AI Agent** dan **Telegram Bot** melalui 4 fungsi operasional:
- **Isolasi Sesi Percakapan per Pengguna Telegram**: Workflow n8n memetakan `message.chat.id` unik dari setiap pengguna Telegram ke dalam kunci sesi memori terpisah (`tg_<chat_id>`) sehingga riwayat percakapan antar pelanggan tidak pernah bercampur.
- **4 Tool Operasional Langsung ke Backend**:
  1. `get_available_devices` (`GET /api/public/devices`): Mengecek ketersediaan stok perangkat secara real-time beserta perhitungan estimasi biaya perjalanan.
  2. `track_rental_booking` (`GET /api/public/rental/track/:code`): Melacak status pesanan, lokasi pengambilan/nomor resi kurir, serta mengirimkan kembali tautan pembayaran Midtrans (`redirectUrl`) menggunakan kode booking unik (`RENT-YYYYMMDD-XXXXXX`).
  3. `update_rental_logistics` (`POST /api/public/rental/update-logistics`): Mengubah terminal pengambilan bandara atau alamat pengiriman rumah dari Telegram setelah melewati verifikasi 2-Faktor (`rentalCode` + alamat `email` terdaftar).
  4. `cancel_unpaid_booking` (`POST /api/public/rental/cancel`): Membatalkan pesanan yang belum dibayar melalui verifikasi 2-Faktor (`rentalCode` + `email`), membatalkan sesi Midtrans, dan langsung mengembalikan stok perangkat menjadi `AVAILABLE`.

---

## Struktur Direktori Proyek

```text
javamifi/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Skema database PostgreSQL (User, Device, Rental, Payment, WebhookLog)
│   │   └── seed.ts                 # Data awal perangkat dan akun pengujian
│   └── src/
│       ├── common/                 # Error classes kustom dan helper respons HTTP terstandarisasi
│       ├── config/                 # Validasi environment (Zod), koneksi Prisma, Redis, dan Midtrans
│       ├── features/
│       │   ├── auth/               # Modul autentikasi, registrasi, dan profil pengguna
│       │   ├── device/             # Modul manajemen aset perangkat keras
│       │   ├── rental/             # Modul pemesanan, antrean BullMQ, pengiriman, dan pengembalian
│       │   ├── payment/            # Modul webhook Midtrans dan log rekonsiliasi
│       │   └── public/             # Modul API integrasi n8n AI Agent & layanan mandiri
│       ├── middlewares/            # Middleware autentikasi JWT, RBAC, dan penanganan error global
│       ├── app.ts                  # Konfigurasi aplikasi Express 5
│       └── server.ts               # Titik masuk server HTTP dan inisialisasi worker BullMQ
├── frontend/
│   └── src/
│       ├── components/             # Komponen tata letak (Navbar, AppLayout) dan komponen dasar UI
│       ├── features/
│       │   ├── auth/               # Halaman, form, dan hooks autentikasi
│       │   ├── dashboard/          # Dashboard metrik operasional Admin dan ringkasan Customer
│       │   ├── device/             # Katalog perangkat, filter, pencarian debounce, dan CRUD Admin
│       │   └── rental/             # Alur pemesanan, manajemen pesanan, dispatch, dan inspeksi retur
│       ├── lib/                    # Konfigurasi Axios client dan TanStack QueryClient
│       └── routes/                 # Konfigurasi navigasi dan proteksi rute
├── n8n/
│   └── javamifi-ai-agent-workflow.json  # File workflow n8n siap impor (Telegram + Web Chat + 4 API Tools)
├── N8N_GUIDE.md                    # Dokumentasi teknis dan skenario pengujian n8n AI Agent
├── PRD.md                          # Dokumen spesifikasi kebutuhan produk
└── README.md                       # Dokumentasi utama proyek
```

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js** versi 18 ke atas (direkomendasikan v20 atau v24)
- **PostgreSQL** (berjalan pada port `5432`)
- **Redis** (berjalan pada port `6379` untuk antrean kedaluwarsa BullMQ)
- Akun **Midtrans Sandbox** (untuk kunci API pembayaran)
- **n8n** (dapat dijalankan melalui `npx n8n`, Docker, atau **n8n Cloud**)

### 2. Konfigurasi Backend
Buka terminal dan masuk ke direktori `backend`:

```powershell
cd backend
npm install
```

Buat file `.env` di dalam direktori `backend` dengan konfigurasi berikut:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/javamifi?schema=public"
CLIENT_URL="http://localhost:3000"

JWT_SECRET="ganti_dengan_secret_minimal_8_karakter"
JWT_EXPIRES_IN="1d"

MIDTRANS_SERVER_KEY="SB-Mid-server-XXXXXXXXXXXXXXXX"
MIDTRANS_CLIENT_KEY="SB-Mid-client-XXXXXXXXXXXXXXXX"
MIDTRANS_IS_PRODUCTION="false"

REDIS_HOST="localhost"
REDIS_PORT=6379
```

Jalankan pembuatan klien Prisma, migrasi skema database, pengisian data awal (seed), dan nyalakan server:

```powershell
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```
Server backend akan berjalan pada `http://localhost:5000`.

### 3. Konfigurasi Frontend
Buka terminal baru dan masuk ke direktori `frontend`:

```powershell
cd frontend
npm install
npm run dev
```
Aplikasi web akan berjalan pada `http://localhost:3000`.

### 4. Konfigurasi Webhook Midtrans & Otomasi n8n
1. **Ekspos Port Backend Lokal (Jika Menggunakan n8n Cloud / Webhook Midtrans)**:
   Jalankan tunnel HTTPS untuk meneruskan trafik ke port `5000`:
   ```powershell
   ngrok http 5000
   ```
2. **Pengaturan URL Notifikasi Midtrans Sandbox**:
   - Masuk ke Dashboard Midtrans Sandbox $\to$ **Settings** $\to$ **Payment** $\to$ **Payment Notification URL**.
   - Masukkan URL: `https://<domain-ngrok-anda>.ngrok-free.app/api/payment/notification`.
3. **Impor Workflow n8n AI Agent**:
   - Buka dashboard n8n Anda (lokal di `http://localhost:5678` atau **n8n Cloud**).
   - Pilih menu **Import from File** dan pilih file `n8n/javamifi-ai-agent-workflow.json`.
   - Buka node **Normalize Channel & Isolate Session** dan sesuaikan nilai `backendBaseUrl` dengan URL backend atau ngrok Anda.
   - Hubungkan kredensial **Telegram Bot** pada node `Telegram Trigger` dan `Send Telegram Reply`, serta kredensial **Google Gemini API** pada node model AI.
   - Aktifkan workflow (**Active**) untuk mulai menerima pesan pelanggan melalui Telegram Bot maupun antarmuka Chat n8n. Panduan skenario pengujian lengkap tersedia pada file [N8N_GUIDE.md](N8N_GUIDE.md).
