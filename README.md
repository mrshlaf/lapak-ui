# Lapak UI — Marketplace & Community Platform for UI Students

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Managed-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis)](https://upstash.com/)

**Lapak UI** adalah platform marketplace dan social community berbasis web yang dirancang khusus untuk mahasiswa Universitas Indonesia. Platform ini menyatukan tiga ekosistem dalam satu produk: marketplace barang & jasa, sistem reservasi COD terstruktur, dan social feed komunitas kampus.

---

## 🌟 Vision & Mission

Menjadi platform digital mahasiswa UI yang paling relevan — tempat bertransaksi, berinteraksi, dan membangun komunitas dalam satu ekosistem kampus yang modern, transparan, dan terpercaya.

## 🚀 Key Features

### 🛒 Marketplace System
- **Barang & Jasa:** Jual beli barang bekas atau tawarkan jasa profesional mahasiswa.
- **Advanced Filtering:** Cari berdasarkan kategori, rentang harga, hingga fakultas seller.
- **Wishlist:** Simpan produk impian untuk dibeli nanti.

### ⏳ Reservation System (Built with Redis)
- **Anti-Ghosting Timer:** Sistem reservasi COD dengan timer otomatis (2j/6j/12j/24j) yang ditenagai oleh Redis TTL.
- **Status "Reserved":** Memberikan sinyal trust kepada pembeli lain tanpa mematikan listing.

### 💬 Social & Community Feed
- **Campus Base:** Timeline publik untuk berbagi info, mencari barang, atau sekadar berinteraksi.
- **Realtime Chat:** Komunikasi langsung antara buyer dan seller menggunakan Supabase Realtime.

### 🔔 Multi-Channel Notifications
- **In-App:** Notifikasi real-time di dalam aplikasi.
- **Telegram Bot:** Dapatkan update transaksi langsung ke ponsel Anda.
- **Email (Resend):** Rekap transaksi dan reservasi penting via email.
- **Google Calendar:** Otomatis membuat jadwal COD di kalender Anda.

---

## 🛠️ Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Caching & Timers:** Redis (Upstash)
- **Realtime:** Supabase Realtime (WebSockets)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Custom Session-based Auth with Bcrypt
- **Deployment:** Vercel

---

## 📊 Database Schema

Project ini menggunakan skema basis data relasional yang kompleks dan ter-normalisasi (3NF):

- **Users:** Manajemen akun & profil mahasiswa.
- **Products:** Listing barang/jasa dengan relasi multi-image.
- **Reservations & Transactions:** Alur logis dari booking hingga COD selesai.
- **Posts & Comments:** Struktur social graph untuk community feed.
- **Notifications:** Sistem antrean notifikasi multi-channel.

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- Redis instance (Upstash recommended)

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/username/lapak-ui.git
   cd lapak-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Buat file `.env` di root directory dan isi variabel berikut:
   ```env
   DATABASE_URL="postgresql://..."
   REDIS_URL="redis://..."
   RESEND_API_KEY="re_..."
   TELEGRAM_BOT_TOKEN="..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Database Migration:
   ```bash
   npx prisma migrate dev
   ```

5. Run Development Server:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy: Apple-Grade Minimalist

Lapak UI mengusung bahasa desain yang bersih, premium, dan intuitif:
- **Less is More:** Hanya menampilkan elemen yang fungsional.
- **Yellow Accent (#FBDA00):** Warna kuning "Makara" hanya digunakan untuk elemen krusial (CTA, status aktif).
- **Monochrome Foundation:** Dasar hitam-putih untuk memberikan kesan profesional dan modern.

---

## 👨‍🏫 Project Context

Project ini dibangun sebagai tugas akhir **Praktikum Sistem Basis Data, FTUI 2025/2026**. Fokus utama adalah pada desain skema basis data yang kuat, penggunaan Redis untuk real-time state management, dan integrasi multi-channel API.

---

Developed with ❤️ for Universitas Indonesia.
