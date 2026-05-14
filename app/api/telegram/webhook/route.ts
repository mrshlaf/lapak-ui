import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramToken } from "@/lib/telegram-tokens";

/**
 * POST /api/telegram/webhook
 * Menerima payload update dari Telegram (melalui Webhook asli atau Script Proxy lokal).
 * Memproses perintah /start [token] untuk menautkan akun pengguna secara otomatis.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || !message.text || !message.chat || !message.chat.id) {
      return NextResponse.json({ ok: true, skipped: "Bukan pesan teks valid." });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Deteksi perintah deep-linking /start [token]
    if (text.startsWith("/start ")) {
      const token = text.substring(7).trim().toUpperCase();
      const userId = verifyTelegramToken(token);

      if (userId) {
        // Tautkan telegramChatId pengguna di PostgreSQL via Prisma
        await prisma.user.update({
          where: { id: userId },
          data: { telegramChatId: BigInt(chatId) },
        });

        // Kirim ucapan selamat balik ke chat Telegram pengguna
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "🎉 *Selamat!*\n\nAkun Lapak UI Anda telah *berhasil dihubungkan* dengan bot ini! Sekarang Anda akan menerima notifikasi transaksi secara langsung dan realtime di sini. 🔔",
              parse_mode: "Markdown",
            }),
          });
        }

        return NextResponse.json({ ok: true, linked: true, userId });
      } else {
        // Beri tahu pengguna jika token tidak valid/kedaluwarsa
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "⚠️ *Gagal Menghubungkan*\n\nKode verifikasi salah, tidak valid, atau sudah kedaluwarsa (berlaku 10 menit).\n\nSilakan kembali ke halaman Profil Lapak UI, muat ulang halaman, klik tombol 'Hubungkan Telegram' untuk membuat kode baru, lalu klik tautannya kembali.",
              parse_mode: "Markdown",
            }),
          });
        }

        return NextResponse.json({ ok: true, error: "Token tidak valid atau kedaluwarsa." });
      }
    }

    // Respons default untuk pesan biasa di luar command /start [token]
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Halo! Bot ini digunakan khusus untuk mengirim notifikasi aktivitas transaksi Anda di Lapak UI.\n\nUntuk menghubungkan akun Anda, silakan masuk ke halaman Profil di website Lapak UI dan klik tombol *Hubungkan Telegram*.",
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[TELEGRAM WEBHOOK ERROR]", e);
    return NextResponse.json({ ok: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
