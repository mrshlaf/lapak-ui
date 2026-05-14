const fs = require('fs');
const path = require('path');

// 1. Memuat file .env atau .env.local untuk mengambil token bot
try {
  const dotenv = require('dotenv');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  const envPath = path.resolve(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('⚡ Terdeteksi berkas .env. Konfigurasi dimuat.');
  }
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
    console.log('⚡ Terdeteksi berkas .env.local. Konfigurasi di-override.');
  }
} catch (e) {
  console.log('ℹ️ dotenv tidak terpasang, membaca environment variable sistem.');
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: TELEGRAM_BOT_TOKEN tidak ditemukan di file .env atau .env.local!');
  console.log('Silakan tambahkan token bot Anda dari @BotFather terlebih dahulu.');
  process.exit(1);
}

const targetUrl = 'http://localhost:3000/api/telegram/webhook';
let offset = 0;

console.log('\x1b[36m%s\x1b[0m', '🤖 Proxy Long-Polling Telegram Bot Lapak UI Aktif!');
console.log(`Membaca update bot id: ${token.split(':')[0]}`);
console.log(`Meneruskan setiap update ke: ${targetUrl}\n`);
console.log('Menunggu pesan masuk di Telegram (Tekan Ctrl+C untuk keluar)...');

// 2. Fungsi polling secara sekuensial menggunakan fetch bawaan Node.js
async function pollUpdates() {
  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=15`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Telegram API merespons dengan status ${res.status}`);
    }

    const data = await res.json();
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        // Update offset agar tidak memproses update yang sama berkali-kali
        offset = update.update_id + 1;

        console.log(`📬 Terdeteksi update_id: ${update.update_id}. Meneruskan ke webhook lokal...`);
        
        try {
          // Kirim payload update ke Next.js API route lokal
          const forwardRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
          });

          if (forwardRes.ok) {
            const result = await forwardRes.json();
            if (result.linked) {
              console.log('\x1b[32m%s\x1b[0m', `  🎉 SUKSES: Akun Telegram berhasil ditautkan ke User ID: ${result.userId}!`);
            } else {
              console.log(`  ℹ️ Webhook lokal merespons sukses:`, result);
            }
          } else {
            console.error(`  ❌ Webhook lokal merespons dengan error HTTP ${forwardRes.status}`);
          }
        } catch (err) {
          console.error(`  ❌ Gagal menghubungkan ke Next.js webhook. Apakah Next.js server ('npm run dev') berjalan di port 3000?`);
        }
      }
    }
  } catch (error) {
    console.error(`⚠️ Terjadi kesalahan polling:`, error.message);
    // Tunggu 5 detik sebelum mencoba lagi saat terjadi gangguan jaringan
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Lanjutkan polling berikutnya
  setTimeout(pollUpdates, 200);
}

pollUpdates();
