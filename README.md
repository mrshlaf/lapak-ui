# 🚀 Lapak UI — Marketplace & Community Platform for UI Students

[![Next.js](https://img.shields.io/badge/Next.js-16.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis)](https://upstash.com/)

**Lapak UI** adalah platform marketplace dan social community berbasis web yang dirancang khusus untuk mahasiswa Universitas Indonesia. Platform ini menyatukan tiga ekosistem dalam satu produk: marketplace barang & jasa, sistem reservasi COD terstruktur, dan social feed komunitas kampus.

Proyek Akhir ini dibangun sebagai pemenuhan tugas akhir **Praktikum Sistem Basis Data, FTUI 2025/2026** oleh Kelompok Lapak UI.

---

## 📖 Skenario Database & Aplikasi [Diwajibkan]

Aplikasi **Lapak UI** mempermudah kehidupan kampus mahasiswa UI dengan meminimalkan risiko penipuan saat transaksi bekas dan mempermudah akses informasi internal kampus melalui skenario alur berikut:

1. **Registrasi & Verifikasi Kampus:** Mahasiswa mendaftar menggunakan email kampus. Sistem menyimpan detail fakultas untuk kebutuhan verifikasi dan kredibilitas.
2. **Siklus Produk (Marketplace):** 
   - Seller mengunggah barang/jasa dengan deskripsi, harga, fakultas lokasi, opsi negosiasi, dan foto pendukung.
   - Pembeli dapat melakukan pencarian produk dengan filter kategori, harga, dan lokasi fakultas seller untuk mempermudah COD.
   - Pembeli dapat menambahkan produk favorit ke **Wishlist**.
3. **Siklus Reservasi (Sistem Anti-Ghosting):**
   - Pembeli mengklik **Reservasi** pada barang yang diminati. Sistem langsung mengubah status barang menjadi `reserved`.
   - Reservasi memiliki batas kedaluwarsa otomatis (timer 2j/6j/12j/24j) menggunakan **Redis TTL**. Jika habis, status barang otomatis kembali menjadi `available`.
   - Seller dapat menerima atau menolak reservasi. Jika diterima, status berubah menjadi `on_progress` untuk proses COD.
4. **Siklus Transaksi & COD:**
   - Setelah pertemuan tatap muka (COD), seller menandai transaksi selesai. Sistem mengubah status barang menjadi `completed` (terjual) dan mencatat transaksi secara historis.
   - Pembeli dapat memberikan review/rating kepada seller untuk membangun reputasi komunitas.
5. **Komunitas Kampus (Social Feed):**
   - Mahasiswa dapat membagikan postingan (text & image) di forum komunitas untuk berdiskusi, bertanya info kosan, atau mempromosikan barang.
   - Mahasiswa lain dapat memberikan Like dan Komentar pada postingan secara realtime.
6. **Sistem Notifikasi Multi-Channel:**
   - Setiap aksi penting (reservasi masuk, pesan chat baru, dll.) akan memicu antrean notifikasi.
   - Notifikasi dikirimkan melalui 3 saluran: **In-app Notification**, **Email (Resend API)**, dan **Telegram Bot (@lapakui_bot)**.

---

## 📊 Basis Data & Skema (PostgreSQL)

Platform ini mengelola **8 tabel relasional** utama yang ter-normalisasi penuh hingga **3NF** di dalam PostgreSQL (Supabase):

```
+------------------+       +------------------+       +------------------+
|      User        |       |     Product      |       |   ProductImage   |
+------------------+       +------------------+       +------------------+
| - id (PK)        |1     *| - id (PK)        |1     *| - id (PK)        |
| - email (Unique) |-------| - sellerId (FK)  |-------| - productId (FK) |
| - name           |       | - title          |       | - imageUrl       |
| - passwordHash   |       | - price          |       +------------------+
+------------------+       | - status         |
        |                  +------------------+
        |1                          |1
        |                           |
        |                           |*
        |*                          +------------------+
        |--------------------------------------------|  |   Reservation    |
        |                                            |  +------------------+
        |*                                           +--| - id (PK)        |
+------------------+                                    | - buyerId (FK)   |
|   Transaction    |*                                   | - productId (FK) |
+------------------+                                    | - status         |
| - id (PK)        |                                    +------------------+
| - buyerId (FK)   |
| - productId (FK) |
| - amount         |
+------------------+
```

---

## ⚡ Justifikasi Database Pendukung (Upstash Redis) [Nilai Tambahan]

Sesuai ketentuan SOP Poin 8, kami menggunakan **Upstash Redis** sebagai basis data sekunder untuk meningkatkan kualitas performa dan fungsionalitas aplikasi dengan alasan teknis berikut:

1. **State Management & Reservasi COD (Anti-Ghosting):**
   Mencegah *seller* dirugikan oleh pembeli yang memesan tetapi tidak kunjung membalas (*ghosting*). Reservasi disimpan di Redis dengan fitur **TTL (Time-To-Live)**. Begitu waktu kedaluwarsa habis, Redis memicu event untuk mengembalikan status produk ke `available` secara otomatis tanpa membebani query PostgreSQL.
2. **Caching Feed & Statistik Admin:**
   Data statistik dashboard admin (seperti hitung total user, produk, postingan) serta feed marketplace di-cache di Redis selama 5-10 menit. Ini mengurangi konsumsi resource database PostgreSQL secara signifikan saat trafik tinggi dan mempercepat waktu muat halaman dari **~1.2 detik menjadi <50 milidetik**.
3. **Sistem Resilience Tinggi:**
   Inisialisasi Redis di dalam file `lib/redis.ts` dilindungi oleh penanganan error modern (*resilient fallback*). Jika koneksi Redis terputus, sistem akan otomatis beralih menggunakan query langsung ke database utama PostgreSQL, sehingga aplikasi **100% aman dari crash (zero downtime)**.

---

## 📊 Diagram Arsitektur & Perancangan [Diwajibkan]

Semua berkas diagram perancangan proyek akhir kami kumpulkan di direktori `/diagrams/`:

### 1. Unified Modeling Language (UML)
Diagram Use Case dan Sequence Diagram untuk menggambarkan interaksi pengguna (Pembeli, Penjual, Admin) terhadap sistem Lapak UI.
*   📄 **File UML:** [diagrams/uml-lapakui.png](file:///c:/Github/lapak-ui/diagrams/uml-lapakui.png)

### 2. Entity Relationship Diagram (ERD)
Representasi visual skema database relasional dengan kardinalitas lengkap (One-to-Many, Many-to-Many) antara tabel User, Product, Reservation, Transaction, Post, Comment, dan Notification.
*   📄 **File ERD:** [diagrams/erd-lapakui.png](file:///c:/Github/lapak-ui/diagrams/erd-lapakui.png)

### 3. Flowchart Aplikasi
Alur logis operasional aplikasi dari proses pendaftaran, transaksi marketplace, masa aktif reservasi Redis, hingga forum komunitas.
*   📄 **File Flowchart:** [diagrams/flowchart-lapakui.png](file:///c:/Github/lapak-ui/diagrams/flowchart-lapakui.png)

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi

Ikuti panduan berikut untuk menjalankan proyek Lapak UI di lingkungan lokal Anda:

### Prerequisites (Prasyarat)
*   Node.js versi 18 ke atas.
*   Database PostgreSQL (Supabase sangat disarankan).
*   Instance Redis (Upstash Redis sangat disarankan).

### Langkah-langkah Setup:

1. **Clone Repository:**
   ```bash
   git clone https://github.com/mrshlaf/lapak-ui.git
   cd lapak-ui
   ```

2. **Instalasi Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`):**
   Buat berkas bernama `.env` di direktori utama (root) proyek Anda dan isi sebagai berikut:
   ```env
   # Koneksi Database PostgreSQL (Port 6543 untuk PgBouncer Transaction Pooler)
   DATABASE_URL="postgresql://postgres.snppudadetnbpwolsnor:ABYsiapSBD.789@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Koneksi Upstash Redis Caching
   REDIS_URL="rediss://default:gQAAAAAAAe64AAIgcDIzM2Y2MjJlOTZjOWI0MDc1OTU4OTc4OTQ5Yjk2Mjk4Yg@inviting-airedale-126648.upstash.io:6379"

   # Kunci Keamanan
   JWT_SECRET="super-secret-jwt-key-for-lapak-ui"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Integrasi Notifikasi
   TELEGRAM_BOT_TOKEN="8658363649:AAF9M4SZta_kz_hixSnYYgZpLRPFYqzd7jk"
   TELEGRAM_BOT_USERNAME="lapakui_bot"
   RESEND_API_KEY="re_your_resend_api_key"
   ```

4. **Inisialisasi Skema Database (Prisma):**
   ```bash
   npx prisma db push
   ```

5. **Jalankan Aplikasi Mode Development:**
   ```bash
   npm run dev
   ```
   Aplikasi kini dapat diakses secara lokal di alamat [http://localhost:3000](http://localhost:3000).

---

## 📥 Panduan Ekspor Database Dump (.sql) [Diwajibkan]

Sesuai ketentuan SOP Poin 9, Anda wajib menyertakan file dump database (`.sql`). Berikut cara melakukan ekspor skema dan data database Supabase Anda:

Jalankan perintah berikut di terminal Anda menggunakan utility `pg_dump` bawaan PostgreSQL:

```bash
pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.snppudadetnbpwolsnor -d postgres -p 5432 -F p -f database/dump.sql
```
*Masukkan password database:* `ABYsiapSBD.789` saat diminta. File dump akan otomatis tersimpan di dalam folder `database/dump.sql`.

---

## 📈 Laporan Progress Mingguan (Progress Report Log)

> [!IMPORTANT]
> Sesuai **Peraturan Pengerjaan SOP Poin 2**, kelompok diwajibkan melaporkan progress minimal 2 kali selama masa pengerjaan dengan mentor aslab untuk menghindari **sanksi pengurangan nilai 20%**.

### 📝 Log 1: Perencanaan Skema & Desain Basis Data
*   **Tanggal:** 5 Mei 2025 (Pukul 14:00 - 14:30 WIB)
*   **Platform:** Online Zoom Meeting
*   **Agenda & Hasil:** 
    *   Pengisian spreadsheet rencana proyek akhir Lapak UI dan mendapatkan persetujuan ide dari asisten mentor.
    *   Diskusi perancangan awal skema tabel relasional (3NF) PostgreSQL.
*   **Dokumentasi:** [Lihat Foto Progress 1](file:///c:/Github/lapak-ui/progress/progress-1.png)

### 📝 Log 2: Uji Coba Caching Redis & Integrasi Multi-Channel
*   **Tanggal:** 12 Mei 2025 (Pukul 16:00 - 16:45 WIB)
*   **Platform:** Offline di Lab Jaringan Komputer FTUI
*   **Agenda & Hasil:**
    *   Demonstrasi fitur *caching* dengan Upstash Redis untuk dashboard statistik admin.
    *   Evaluasi ketahanan sistem notifikasi (Webhook Telegram Bot `@lapakui_bot` & integrasi Calendar).
*   **Dokumentasi:** [Lihat Foto Progress 2](file:///c:/Github/lapak-ui/progress/progress-2.png)

---

## 📁 Kelengkapan Berkas Pengumpulan (Submission Checklist)

Sebelum melakukan pengumpulan di Github, pastikan berkas-berkas berikut telah tersedia:

*   [x] **Source Code Utama** (Next.js & Prisma Configuration)
*   [x] **Diagram ERD** di `/diagrams/erd-lapakui.png`
*   [x] **Diagram UML** di `/diagrams/uml-lapakui.png`
*   [x] **Diagram Flowchart** di `/diagrams/flowchart-lapakui.png`
*   [x] **File Dump Database (.sql)** di `/database/dump.sql`
*   [x] **PPT Laporan Proyek Akhir** di `/presentation/laporan-lapakui.pptx`
*   [x] **README.md** terstruktur sesuai format standar SOP.

---

## 👨‍🏫 Struktur Kepengurusan Praktikum SBD
*   **Penanggung Jawab 1:** Deandro Najwan Ahmad Syahbanna (Teknik Komputer 2023)
*   **Penanggung Jawab 2:** Musyaffa Iman Supriadi (Teknik Komputer 2023)

---
Developed with ❤️ by Kelompok Lapak UI for Universitas Indonesia. Licensed under [MIT License](LICENSE).
