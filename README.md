# JavaMifiRent - Sistem ERP Operasional Penyewaan Pocket Wi-Fi Internasional

JavaMifiRent adalah aplikasi web berbasis Enterprise Resource Planning (ERP) yang dirancang untuk mengelola operasional penyewaan perangkat keras Pocket Wi-Fi bagi pelaku perjalanan internasional. Sistem ini mengintegrasikan manajemen aset perangkat keras, reservasi pelanggan dengan penguncian stok atomik, pembayaran otomatis melalui Midtrans Snap Sandbox, antrean pembatalan otomatis berbasis Redis (BullMQ), manajemen logistik pengambilan dan pengembalian perangkat, serta otomasi layanan pelanggan menggunakan n8n AI Agent yang terhubung langsung ke Telegram Bot.

---

## Galeri Antarmuka & Tampilan Sistem (Visual Overview)

### A. Portal Operasional ERP & Manajemen Armada (Peran: Administrator)

#### 1. Admin Operations Center & Telemetri Armada Real-Time
Menampilkan metrik utilisasi armada, pendapatan kotor terverifikasi, alokasi perangkat keras (Available, In Use, Maintenance, rata-rata kesehatan baterai), serta daftar pesanan terbaru secara langsung.
![Admin Operations Center](images/App-01.png)

#### 2. Manajemen Inventaris Perangkat Keras (`Device Fleet`)
Mengelola siklus hidup unit perangkat keras lengkap dengan pencatatan Nomor Seri (`Serial Number`), `IMEI`, kategori kecepatan (`4G` / `5G`), persentase kesehatan baterai (`Battery Health`), tarif sewa harian, dan status operasional.
![Device Fleet Management](images/App-02.png)

#### 3. Manajemen Penyewaan, Pengiriman, & Inspeksi Retur (`Rental Management`)
Memantau seluruh jadwal penyewaan pelanggan, metode pengambilan (`Airport Pickup` atau `Home Delivery`), penyerahan perangkat (`Dispatch`), serta inspeksi kondisi fisik perangkat saat dikembalikan.
![Rental Management](images/App-03.png)

---

### B. Portal Pelanggan, Reservasi & Payment Gateway Midtrans (Peran: Customer)

#### 4. Halaman Autentikasi Pengguna (`Sign In`)
Antarmuka autentikasi terproteksi menggunakan JSON Web Token (JWT) pada `HTTP-Only Cookie` dengan pengalihan otomatis sesuai peran (`ADMIN` atau `CUSTOMER`).
![Sign In Page](images/App-04.png)

#### 5. Dashboard Pelanggan & Status Perjalanan Aktif (`Customer Dashboard`)
Menampilkan banner perjalanan terkonfirmasi, ringkasan perangkat yang sedang disewa, jadwal keberangkatan mendatang, serta riwayat pemesanan pelanggan.
![Customer Dashboard](images/App-08.png)

#### 6. Formulir Reservasi Perangkat & Kalkulasi Biaya Otomatis (`Rent Pocket WiFi`)
Pelanggan memilih negara tujuan, tanggal sewa, serta metode pengambilan perangkat (Konter Bandara 24/7 di CGK/DPS/SUB atau Pengiriman Kurir ke Rumah) dengan estimasi total harga real-time.
![Rent Pocket WiFi Modal](images/App-05.png)

#### 7. Integrasi Checkout Midtrans Snap Sandbox (Virtual Account, QRIS, Kartu Kredit)
Setelah pesanan dibuat, perangkat dikunci secara atomik (`BOOKED`) selama 30 menit dan pelanggan diarahkan ke halaman pembayaran Midtrans Snap.
![Midtrans Snap Checkout](images/App-06.png)

#### 8. Konfirmasi Pembayaran & Rekonsiliasi Webhook Otomatis
Saat pembayaran berhasil diselesaikan, Midtrans mengirimkan webhook ber-signature SHA-512 ke backend untuk memperbarui status pembayaran menjadi `PAID` dan mengonfirmasi pesanan (`CONFIRMED`).
![Midtrans Payment Successful](images/App-07.png)

---

### C. Otomasi AI Customer Support Agent (n8n Cloud & Telegram Bot)

#### 9. Arsitektur Workflow n8n AI Concierge & Omnichannel ERP Support Agent
Workflow di n8n Cloud yang menggabungkan `Telegram Trigger` dan `Web Chat Trigger`, mengisolasi sesi memori per pengguna Telegram (`tg_<chat_id>`), menghubungkan model LLM (**DeepSeek**), dan mengeksekusi 4 HTTP Request Tool langsung ke REST API Backend.
![Arsitektur Workflow n8n JavaMifi](images/N8N-Architecture.png)

#### 10. Hasil Interaksi Langsung pada Telegram Bot (`Javamifi Rent Support`)
Agen AI secara otonom memanggil API `GET /api/public/devices` ke database PostgreSQL untuk mengecek stok perangkat yang sedang `AVAILABLE`, membandingkan harga sewa harian dan kondisi kesehatan baterai (`Battery Health`), serta memandu lokasi pengambilan di bandara.
![Hasil Chat Telegram Bot JavaMifi Support](images/N8N-Result.png)

---

## Daftar Isi Dokumentasi Teknis

1. [Pemenuhan Spesifikasi Technical Test](#1-pemenuhan-spesifikasi-technical-test)
2. [Arsitektur Sistem & Desain Teknis](#2-arsitektur-sistem--desain-teknis)
3. [Pembagian Modul Utama](#3-pembagian-modul-utama)
4. [Arsitektur Otomasi n8n AI Agent & Telegram Bot](#4-arsitektur-otomasi-n8n-ai-agent--telegram-bot)
5. [Struktur Direktori Proyek](#5-struktur-direktori-proyek)
6. [Panduan Lengkap Instalasi & Menjalankan Aplikasi](#6-panduan-lengkap-instalasi--menjalankan-aplikasi)
   - [Tahap 1: Persiapan Prasyarat & Infrastruktur Database](#tahap-1-persiapan-prasyarat--infrastruktur-database)
   - [Tahap 2: Instalasi & Menjalankan Backend](#tahap-2-instalasi--menjalankan-backend)
   - [Tahap 3: Instalasi & Menjalankan Frontend](#tahap-3-instalasi--menjalankan-frontend)
   - [Tahap 4: Konfigurasi Tunneling (ngrok) & Payment Gateway Midtrans](#tahap-4-konfigurasi-tunneling-ngrok--payment-gateway-midtrans)
   - [Tahap 5: Pembuatan Bot Telegram Melalui BotFather](#tahap-5-pembuatan-bot-telegram-melalui-botfather)
   - [Tahap 6: Konfigurasi Workflow n8n (DeepSeek / Model Lain & Telegram)](#tahap-6-konfigurasi-workflow-n8n-deepseek--model-lain--telegram)
7. [Skenario Pengujian End-to-End](#7-skenario-pengujian-end-to-end)

---

## 1. Pemenuhan Spesifikasi Technical Test

| Kriteria Penilaian | Implementasi pada JavaMifiRent |
| :--- | :--- |
| **Tema Aplikasi (ERP)** | Sistem ERP terpusat untuk manajemen inventaris aset perangkat keras (IMEI, Serial Number, kesehatan baterai), siklus penyewaan, logistik penyerahan/pengembalian, pemantauan keterlambatan (overdue), dan rekonsiliasi pembayaran. |
| **Minimal 3 Modul Utama** | Memiliki 5 modul utama yang berfungsi penuh: (1) Modul Inventaris Perangkat (`Device`), (2) Modul Siklus Penyewaan & Logistik (`Rental`), (3) Modul Pembayaran & Audit Webhook (`Payment`), (4) Modul Autentikasi & RBAC (`Auth`), serta (5) Modul Integrasi Publik & Otomasi AI (`Public`). |
| **API Connection** | Integrasi RESTful API antara React Frontend dan Express Backend, komunikasi server-ke-server dengan Midtrans Snap REST API, serta pemanggilan endpoint internal secara dinamis oleh n8n melalui HTTP Request Tool Calling. |
| **Payment Gateway** | Integrasi penuh dengan **Midtrans Snap (Sandbox)** untuk pembayaran Virtual Account, QRIS, dan Kartu Kredit, dilengkapi penerima webhook asinkron (`POST /api/payment/notification`) dengan validasi tanda tangan kriptografi SHA-512. |
| **Automation Tools (n8n)** | Workflow **n8n AI Concierge & Omnichannel ERP Support Agent** (`n8n/javamifi-ai-agent-workflow.json`) yang terhubung ke **Telegram Bot** dan LLM (DeepSeek / Gemini / OpenAI) untuk pengecekan stok real-time, pelacakan pesanan, pemulihan tautan pembayaran Midtrans, perubahan lokasi pengambilan, dan pembatalan pesanan mandiri. |
| **Frontend Modern** | Dibangun menggunakan **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **TanStack React Query**. |
| **Backend Non-Firebase** | Dibangun menggunakan **Node.js**, **Express 5**, **TypeScript**, **PostgreSQL**, **Prisma ORM 7**, serta **Redis & BullMQ**. |

---

## 2. Arsitektur Sistem & Desain Teknis

### Diagram Arsitektur Keseluruhan

```mermaid
flowchart TB
    subgraph Client_Layer [Lapisan Klien]
        Web[React 19 SPA - Customer & Admin Portal]
        TG[Aplikasi Telegram - Pelanggan]
    end

    subgraph Automation_Layer [Lapisan Otomasi - n8n]
        n8n[n8n AI Agent Workflow]
        LLM[DeepSeek / Gemini LLM + Memori Terisolasi per Chat ID]
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
    TG <-->|Webhook Pesan Telegram| n8n
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

### Prinsip Desain Backend
1. **Modular Feature-Based Architecture**: Setiap fitur bisnis diisolasi ke dalam direktori `backend/src/features/<modul>/` dengan pemisahan tanggung jawab yang ketat:
   - `<modul>.route.ts`: Definisi rute HTTP dan pemasangan middleware otorisasi.
   - `<modul>.handler.ts`: Pengendali HTTP yang menerima request, menjalankan validasi skema, memanggil service, dan mengembalikan respons terstandarisasi.
   - `<modul>.validator.ts`: Validasi input runtime menggunakan **Zod**.
   - `<modul>.service.ts`: Logika bisnis inti dan manajemen transaksi database.
   - `<modul>.helper.ts`: Pembuatan objek filter query dan proyeksi kolom database (`select`).
   - `<modul>.dto.ts`: Kontrak tipe data TypeScript (Data Transfer Objects) untuk input dan output antar lapisan.
2. **Standarisasi Amplop Respons HTTP**: Seluruh endpoint mengembalikan struktur JSON yang konsisten (`{ status: "success" | "error", message: string, data: T | null }`) melalui helper terpusat pada `backend/src/common/response.ts`.
3. **Pencegahan Race Condition (Compare-and-Swap & Transaksi ACID)**: Saat pelanggan memesan perangkat, status perangkat dikunci secara atomik dari `AVAILABLE` menjadi `BOOKED` di dalam transaksi database (`prisma.$transaction`). Jika dua pengguna memesan perangkat yang sama pada waktu bersamaan, hanya satu transaksi yang berhasil sementara permintaan lainnya ditolak secara aman (`409 Conflict`).
4. **Proyeksi Keamanan Tingkat Database**: Identitas sensitif perangkat keras (`imei` dan `serialNumber`) disembunyikan dari peran `CUSTOMER` dan endpoint publik langsung pada level query PostgreSQL melalui proyeksi Prisma `select`.

### Prinsip Desain Frontend
1. **Single-Purpose Atomic Components**: Setiap komponen antarmuka memiliki satu tanggung jawab spesifik (komponen tabel, baris tabel, filter status, input pencarian dengan debounce, dan dialog aksi terpisah).
2. **Manajemen Server-State Terpusat**: Menggunakan **TanStack React Query** untuk sinkronisasi data, caching, invalidasi otomatis setelah mutasi, serta pemisahan tampilan berdasarkan peran pengguna (`ADMIN` vs `CUSTOMER`).

---

## 3. Pembagian Modul Utama

### Modul 1: Manajemen Inventaris & Aset Perangkat Keras (`Device`)
- Pencatatan spesifikasi teknis perangkat: Nomor Seri (`serialNumber`), `imei`, nama model, persentase kesehatan baterai (`batteryHealth`), kategori kecepatan (`4G 150Mbps`, `4G 300Mbps`, `5G 500Mbps`, `5G 1Gbps`), serta tarif sewa harian (`dailyRate`).
- Transisi status perangkat secara ketat: `AVAILABLE`, `BOOKED`, `RENTED`, `MAINTENANCE`, `LOST`, dan `RETIRED`.
- Pencarian perangkat dengan mekanisme debounce serta penyaringan berdasarkan status dan kategori kecepatan.

### Modul 2: Siklus Penyewaan & Logistik (`Rental`)
- **Kalkulasi Durasi & Tarif Otoritatif**: Perhitungan jumlah hari sewa (inklusif) dan total biaya dilakukan sepenuhnya di sisi server.
- **Manajemen Metode Penyerahan (`FulfillmentType`)**: Mendukung pengambilan di konter bandara 24/7 (`AIRPORT_PICKUP` di CGK T2/T3, DPS, SUB) maupun pengiriman kurir ke alamat rumah (`HOME_DELIVERY`) beserta pencatatan nomor resi (`trackingNumber`).
- **Penyerahan & Inspeksi Pengembalian Perangkat**: Administrator dapat mencatat penyerahan perangkat (`CONFIRMED` ke `ACTIVE`) serta memproses inspeksi kondisi fisik perangkat saat dikembalikan (`GOOD` kembali ke `AVAILABLE`, `DAMAGED` masuk ke `MAINTENANCE`, atau `LOST`).
- **Kedaluwarsa Otomatis 30 Menit (BullMQ & Redis)**: Setiap pesanan berstatus `PENDING_PAYMENT` dijadwalkan pada antrean tertunda BullMQ. Jika pembayaran tidak diselesaikan dalam 30 menit, worker secara otomatis membatalkan pesanan dan mengembalikan status perangkat menjadi `AVAILABLE`.

### Modul 3: Pembayaran & Rekonsiliasi Webhook (`Payment`)
- **Pembuatan Sesi Midtrans Snap**: Menghasilkan `snapToken` dan `redirectUrl` sebelum mengunci perangkat di database sehingga kegagalan jaringan ke pihak ketiga tidak pernah meninggalkan data menggantung.
- **Penanganan Webhook Cepat & Asinkron (`POST /api/payment/notification`)**:
  1. Memverifikasi tanda tangan kriptografi `SHA-512(order_id + status_code + gross_amount + ServerKey)`.
  2. Mencatat payload mentah ke tabel audit `payment_webhook_logs` dan langsung mengembalikan respons `200 OK` ke Midtrans tanpa menunggu proses hilir.
  3. Memproses perubahan status pembayaran (`PAID`, `EXPIRED`, `FAILED`), memperbarui status penyewaan menjadi `CONFIRMED`, serta membatalkan timer kedaluwarsa BullMQ secara asinkron di latar belakang.

### Modul 4: Autentikasi & Kontrol Akses (`Auth`)
- Autentikasi berbasis JSON Web Token (JWT) yang disimpan di dalam `HTTP-Only Cookie`.
- Pengaturan hak akses berbasis peran (`Role-Based Access Control`) antara `ADMIN` dan `CUSTOMER`.

### Modul 5: Integrasi Publik & Otomasi Layanan Pelanggan AI (`Public` & `n8n`)
- Menyediakan endpoint terproteksi proyeksi database untuk diintegrasikan dengan workflow **n8n AI Agent** pada Telegram dan Web Chat.

---

## 4. Arsitektur Otomasi n8n AI Agent & Telegram Bot

Karena bot Telegram bersifat publik/universal, workflow `n8n/javamifi-ai-agent-workflow.json` menerapkan 3 lapisan keamanan dan isolasi:
1. **Normalisasi Kanal & Isolasi Memori per Pengguna (`Normalize Channel & Isolate Session`)**:
   - Menyatukan pesan masuk dari **Telegram Trigger** maupun **When chat message received** (Web Chat n8n).
   - Mengekstrak `message.chat.id` unik milik pengirim Telegram menjadi `sessionId = tg_<chat_id>` pada node **Per-User Isolated Memory** sehingga riwayat percakapan Pengguna A dan Pengguna B terpisah sepenuhnya.
2. **4 Tool HTTP Langsung ke Backend ERP**:
   - `Tool: Get Available Devices` (`GET /api/public/devices`): Mengambil daftar perangkat berstatus `AVAILABLE` secara real-time dari PostgreSQL untuk rekomendasi perangkat dan perhitungan estimasi biaya sewa.
   - `Tool: Track Booking & Payment Link` (`GET /api/public/rental/track/:code`): Melacak status pesanan, lokasi pengambilan/nomor resi kurir, serta mengirimkan ulang tautan pembayaran Midtrans (`redirectUrl`) menggunakan kode booking (`RENT-YYYYMMDD-XXXXXX`).
   - `Tool: Update Pickup or Delivery` (`POST /api/public/rental/update-logistics`): Mengubah terminal pengambilan bandara atau alamat pengiriman rumah langsung dari Telegram dengan **Verifikasi 2-Faktor** (wajib menyertakan `rentalCode` dan alamat `email` pemilik akun).
   - `Tool: Cancel Unpaid Booking` (`POST /api/public/rental/cancel`): Membatalkan pesanan `PENDING_PAYMENT` dengan **Verifikasi 2-Faktor** (`rentalCode` + `email`), membatalkan sesi pembayaran di Midtrans, dan langsung mengembalikan stok perangkat menjadi `AVAILABLE`.
3. **Pemformatan HTML & Pengiriman Balasan Telegram (`Format Reply for Telegram` & `Send Telegram Reply`)**:
   - Mengonversi format Markdown dari LLM menjadi tag HTML yang didukung Telegram (`<b>`, `<code>`) dan mengirimkannya kembali ke `telegramChatId` pengirim.

---

## 5. Struktur Direktori Proyek

```text
javamifi/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Skema database PostgreSQL (User, Device, Rental, Payment, WebhookLog)
│   │   └── seed.ts                 # Script pengisian data awal katalog perangkat Pocket Wi-Fi
│   └── src/
│       ├── common/                 # Custom error classes dan helper respons HTTP terstandarisasi
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
├── images/                         # Dokumentasi tangkapan layar aplikasi, Midtrans, dan n8n
├── n8n/
│   ├── N8N-Architecture.png               # Gambar arsitektur workflow n8n
│   └── javamifi-ai-agent-workflow.json    # File workflow n8n siap impor (tanpa kredensial)
├── PRD.md                          # Dokumen spesifikasi kebutuhan produk
└── README.md                       # Dokumentasi utama proyek
```

---

## 6. Panduan Lengkap Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan seluruh ekosistem aplikasi (Database, Backend, Frontend, Midtrans Webhook, Telegram Bot, dan n8n).

---

### Tahap 1: Persiapan Prasyarat & Infrastruktur Database

Pastikan perangkat Anda telah terinstal:
1. **Node.js** versi 18 ke atas (direkomendasikan v20 atau v24).
2. **PostgreSQL** yang berjalan pada port `5432`.
3. **Redis** yang berjalan pada port `6379` (diperlukan oleh BullMQ untuk fitur pembatalan otomatis 30 menit).

Apabila Anda menggunakan **Docker** untuk menjalankan PostgreSQL dan Redis secara cepat, jalankan perintah berikut di terminal:

```powershell
# Menjalankan container PostgreSQL
docker run --name javamifi-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=javamifi -p 5432:5432 -d postgres:16-alpine

# Menjalankan container Redis
docker run --name javamifi-redis -p 6379:6379 -d redis:7-alpine
```

---

### Tahap 2: Instalasi & Menjalankan Backend

1. Buka terminal dan masuk ke direktori `backend`:
   ```powershell
   cd backend
   npm install
   ```

2. Buat file `.env` di dalam direktori `backend` (`backend/.env`) dan isi dengan konfigurasi berikut:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/javamifi?schema=public"
   CLIENT_URL="http://localhost:3000"

   JWT_SECRET="javamifi_super_secret_jwt_key_2026"
   JWT_EXPIRES_IN="1d"

   MIDTRANS_SERVER_KEY="SB-Mid-server-XXXXXXXXXXXXXXXXXXXXXXXX"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-XXXXXXXXXXXXXXXXXXXXXXXX"
   MIDTRANS_IS_PRODUCTION="false"

   REDIS_HOST="localhost"
   REDIS_PORT=6379
   ```
   *(Catatan: Ganti `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` dengan kunci Sandbox dari akun Midtrans Anda. Cara mendapatkannya dijelaskan pada Tahap 4).*

3. Jalankan pembuatan Prisma Client, migrasi tabel database, dan pengisian katalog awal perangkat keras (seed):
   ```powershell
   npm run prisma:generate
   npx prisma migrate deploy
   npm run db:seed:devices
   ```

4. Jalankan server pengembangan backend:
   ```powershell
   npm run dev
   ```
   Server backend akan aktif di `http://localhost:5000`.

5. **Membuat Akun Pengguna & Mengubah Peran menjadi `ADMIN` (Opsional untuk Pengujian Dashboard Admin)**:
   - Daftar akun baru melalui halaman Sign Up di Frontend (`http://localhost:3000/signup`).
   - Secara bawaan, akun baru memiliki peran `CUSTOMER`. Untuk menjadikan akun sebagai `ADMIN`, jalankan Prisma Studio (`npx prisma studio` di folder `backend`) atau jalankan query SQL berikut pada database PostgreSQL Anda:
     ```sql
     UPDATE users SET role = 'ADMIN' WHERE email = 'email_admin_anda@domain.com';
     ```

---

### Tahap 3: Instalasi & Menjalankan Frontend

1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```powershell
   cd frontend
   npm install
   ```

2. Jalankan server pengembangan Vite:
   ```powershell
   npm run dev
   ```
   Aplikasi web Frontend kini dapat diakses melalui browser pada alamat `http://localhost:3000`.

---

### Tahap 4: Konfigurasi Tunneling (ngrok) & Payment Gateway Midtrans

Agar server Midtrans Sandbox dan n8n Cloud dapat mengirimkan request ke backend lokal Anda di port `5000`, ekspos port `5000` menggunakan **ngrok**:

1. Buka terminal baru dan jalankan:
   ```powershell
   ngrok http 5000
   ```
2. Salin alamat HTTPS publik yang muncul pada terminal ngrok (contoh: `https://xxxx-xx-xx-xx.ngrok-free.app`).
3. **Mendapatkan Kunci API & Mengatur Webhook di Dashboard Midtrans Sandbox**:
   - Masuk ke [Dashboard Midtrans](https://dashboard.midtrans.com/) dan pastikan lingkungan di pojok kiri atas diatur ke **Sandbox**.
   - Buka menu **Settings** -> **Access Keys** untuk menyalin **Server Key** (`SB-Mid-server-...`) dan **Client Key** (`SB-Mid-client-...`) ke dalam file `backend/.env`.
   - Buka menu **Settings** -> **Payment** (atau **Configuration**), lalu pada bagian **Payment Notification URL**, masukkan URL webhook backend Anda:
     ```text
     https://<domain-ngrok-anda>.ngrok-free.app/api/payment/notification
     ```
   - Klik **Save**.

---

### Tahap 5: Pembuatan Bot Telegram Melalui BotFather

Untuk menghubungkan workflow n8n dengan Telegram, buat bot baru melalui akun resmi `@BotFather` di aplikasi Telegram:

1. Buka aplikasi **Telegram** dan cari akun resmi **`@BotFather`** (akun terverifikasi).
2. Kirimkan perintah:
   ```text
   /newbot
   ```
3. Masukkan nama tampilan bot Anda (contoh: `JavaMifi Support Concierge`).
4. Masukkan username bot yang diakhiri dengan kata `bot` (contoh: `JavaMifiSupport_bot`).
5. `@BotFather` akan mengirimkan **HTTP API Access Token** (contoh format: `7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`). Salin token tersebut untuk digunakan pada Tahap 6 di n8n.

---

### Tahap 6: Konfigurasi Workflow n8n (DeepSeek / Model Lain & Telegram)

File workflow yang disertakan pada `n8n/javamifi-ai-agent-workflow.json` telah dibersihkan dari seluruh kredensial pribadi sehingga aman dan siap diimpor ke akun n8n Anda.

#### A. Menjalankan n8n & Mengimpor File Workflow
Anda dapat menggunakan **n8n Cloud** (`https://app.n8n.cloud`) maupun menjalankan n8n secara lokal di komputer Anda:
- Jika menjalankan secara lokal melalui NPX:
  ```powershell
  npx n8n start --tunnel
  ```
  Lalu buka `http://localhost:5678`.
- Di dalam editor n8n, klik tombol **Create Workflow**, lalu klik menu **`...` (tiga titik di pojok kanan atas)** -> pilih **Import from File...** -> pilih file:
  ```text
  n8n/javamifi-ai-agent-workflow.json
  ```

#### B. Mengatur URL Backend (`backendBaseUrl`) pada Node Normalisasi
1. Klik dua kali pada node **`Normalize Channel & Isolate Session`**.
2. Pada daftar Assignments, perhatikan variabel **`backendBaseUrl`**:
   - Jika Anda menggunakan **n8n Cloud**, ubah nilainya dari `http://localhost:5000` menjadi URL HTTPS ngrok Anda (contoh: `https://xxxx-xx-xx-xx.ngrok-free.app` tanpa tanda garis miring `/` di akhir).
   - Jika Anda menjalankan n8n secara lokal (`npx n8n`) di mesin yang sama dengan backend, Anda dapat membiarkan nilainya tetap `http://localhost:5000`.
   - Seluruh 4 node HTTP Tool (`Get Available Devices`, `Track Booking & Payment Link`, `Update Pickup or Delivery`, dan `Cancel Unpaid Booking`) akan otomatis membaca variabel `backendBaseUrl` ini.

#### C. Mengonfigurasi Model AI (Menggunakan DeepSeek atau Mengganti ke Model Lain)
Secara bawaan, workflow menggunakan node **`DeepSeek Chat Model1`** (`@n8n/n8n-nodes-langchain.lmChatDeepSeek`). Anda dapat memilih salah satu dari dua opsi berikut:

- **Opsi 1: Menggunakan DeepSeek API (Sesuai Node Bawaan Workflow)**
  1. Dapatkan API Key dari [DeepSeek Platform](https://platform.deepseek.com/api_keys).
  2. Di kanvas n8n, klik dua kali pada node **`DeepSeek Chat Model1`**.
  3. Pada bagian **Credential to connect with**, klik **Create New Credential**.
  4. Tempelkan **API Key DeepSeek** Anda dan klik **Save**.

- **Opsi 2: Mengganti dengan Model Lain (Google Gemini / OpenAI / Groq)**
  1. Klik node **`DeepSeek Chat Model1`** pada kanvas n8n, lalu tekan tombol **`Delete`** atau **`Backspace`** untuk menghapusnya.
  2. Klik tanda **`+`** pada port **Model** di bagian bawah node **`JavaMifi AI Agent`**.
  3. Pilih penyedia model yang Anda inginkan dari daftar (misalnya **Google Gemini Chat Model**, **OpenAI Chat Model**, atau **Groq Chat Model**).
  4. Klik **Create New Credential** pada node model baru tersebut dan masukkan API Key Anda (misalnya API Key gratis dari [Google AI Studio](https://aistudio.google.com/)).

#### D. Menghubungkan Kredensial Telegram Bot
Ada 2 node Telegram di dalam workflow yang perlu dihubungkan dengan **Bot Token** dari Tahap 5:
1. Klik dua kali pada node **`Telegram Trigger`** (di sisi kiri bawah):
   - Pada bagian **Credential to connect with**, pilih **Create New Credential**.
   - Masukkan **Access Token** yang Anda dapatkan dari `@BotFather` ke kolom **Access Token**, lalu klik **Save**.
2. Klik dua kali pada node **`Send Telegram Reply`** (di sisi paling kanan):
   - Pada bagian **Credential to connect with**, pilih kredensial **Telegram account** yang baru saja Anda buat pada langkah sebelumnya.
3. Klik tombol **Save** di pojok kanan atas n8n, lalu ubah sakelar workflow menjadi **Active**.

---

## 7. Skenario Pengujian End-to-End

Setelah seluruh layanan berjalan dan workflow n8n berstatus **Active**, Anda dapat menguji integrasi penuh melalui aplikasi web dan bot Telegram:

### 1. Pengujian Pemesanan & Simulasi Pembayaran Midtrans
1. Masuk ke aplikasi web (`http://localhost:3000`) sebagai `CUSTOMER` dan pesan salah satu perangkat yang berstatus `AVAILABLE`.
2. Catat **Kode Booking** Anda (contoh: `RENT-20261021-XXXXXX`) yang tampil pada tabel penyewaan.
3. Pada halaman pembayaran Midtrans Snap, pilih metode **BCA Virtual Account** atau **QRIS**, lalu salin Nomor Virtual Account atau URL QRIS tersebut.
4. Buka [Midtrans Sandbox Payment Simulator](https://simulator.sandbox.midtrans.com/), tempelkan Nomor Virtual Account / QRIS, dan selesaikan pembayaran.
5. Webhook Midtrans akan memicu endpoint `POST /api/payment/notification`, dan status pesanan Anda pada web akan otomatis berubah dari `PENDING_PAYMENT` menjadi `CONFIRMED`.

### 2. Pengujian Layanan Pelanggan Otomatis via Telegram Bot
Buka bot Telegram yang telah Anda buat dan kirimkan pesan pengujian berikut:

- **Skenario A - Rekomendasi Perangkat & Kalkulasi Biaya Sewa Real-Time**:
  ```text
  Halo, saya berencana pergi ke Jepang selama 5 hari. Perangkat Wi-Fi 5G apa saja yang sedang tersedia saat ini dan berapa total biayanya untuk 5 hari?
  ```
  *Hasil*: AI Agent memanggil `Tool: Get Available Devices` (`GET /api/public/devices`), menampilkan daftar perangkat yang tersedia dari PostgreSQL beserta kesehatan baterainya, dan menghitung total biaya `5 x dailyRate`.

- **Skenario B - Pelacakan Status Booking & Pemulihan Link Pembayaran Midtrans**:
  ```text
  Tolong cek status pesanan saya dengan kode RENT-20261021-XXXXXX dan kirimkan link pembayarannya.
  ```
  *Hasil*: AI Agent memanggil `Tool: Track Booking & Payment Link` (`GET /api/public/rental/track/:code`), menampilkan status pesanan terkini, lokasi konter pengambilan, serta tautan aktif Midtrans Snap (`redirectUrl`) apabila pesanan masih berstatus `PENDING_PAYMENT`.

- **Skenario C - Perubahan Lokasi Pengambilan / Alamat Pengiriman Mandiri (Verifikasi 2-Faktor)**:
  ```text
  Pesawat saya pindah terminal. Tolong ubah lokasi pengambilan untuk pesanan RENT-20261021-XXXXXX menjadi Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1. Email akun saya adalah email_anda@domain.com
  ```
  *Hasil*: AI Agent memanggil `Tool: Update Pickup or Delivery` (`POST /api/public/rental/update-logistics`). Backend memverifikasi kecocokan `rentalCode` dan `email`, memperbarui lokasi pengambilan di PostgreSQL, dan perubahan tersebut langsung terlihat di dashboard web.

- **Skenario D - Pembatalan Pesanan Belum Dibayar & Pelepasan Stok Otomatis (Verifikasi 2-Faktor)**:
  ```text
  Tolong batalkan pesanan saya yang belum dibayar dengan kode RENT-20261021-XXXXXX. Email akun saya adalah email_anda@domain.com
  ```
  *Hasil*: AI Agent memanggil `Tool: Cancel Unpaid Booking` (`POST /api/public/rental/cancel`). Backend memverifikasi `rentalCode` dan `email`, membatalkan transaksi Midtrans, menghentikan timer BullMQ, mengubah status pesanan menjadi `CANCELLED`, dan mengembalikan status perangkat menjadi `AVAILABLE`.
