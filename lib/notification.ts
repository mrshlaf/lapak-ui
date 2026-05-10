import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "RESERVATION_RECEIVED"
  | "RESERVATION_ACCEPTED"
  | "RESERVATION_REJECTED"
  | "RESERVATION_EXPIRED"
  | "COD_SELLER_CONFIRMED"
  | "COD_COMPLETED"
  | "CHAT_MESSAGE"
  | "POST_LIKED"
  | "POST_REPLIED";

interface SendNotificationArgs {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Mengirimkan notifikasi multi-channel sesuai dengan spesifikasi PRD Section 17.
 * Membuat in-app notification di database dan otomatis menyebarkan ke email (Resend)
 * atau Telegram jika dikonfigurasi dan sesuai dengan kriteria pemicu (trigger types).
 */
export async function sendNotification({
  userId,
  type,
  title,
  message,
  link,
}: SendNotificationArgs) {
  // 1. Buat In-App Notification di database SQL PostgreSQL via Prisma
  const inAppNotif = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });

  // Ambil detail kontak user (email dan telegramChatId) untuk pengiriman multi-channel
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, telegramChatId: true },
  });

  if (!user) return inAppNotif;

  // 2. Tentukan Channel Pengiriman Berdasarkan Spesifikasi PRD (Section 17 - Matrix)
  const isEmailEnabled = [
    "RESERVATION_RECEIVED",
    "RESERVATION_ACCEPTED",
    "RESERVATION_EXPIRED",
    "COD_COMPLETED",
  ].includes(type);

  const isTelegramEnabled = [
    "RESERVATION_RECEIVED",
    "RESERVATION_ACCEPTED",
    "RESERVATION_REJECTED",
    "RESERVATION_EXPIRED",
    "COD_SELLER_CONFIRMED",
    "COD_COMPLETED",
    "CHAT_MESSAGE",
    "POST_LIKED",
    "POST_REPLIED",
  ].includes(type);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Kirim melalui Saluran Email (Resend) jika didukung
  if (isEmailEnabled && user.email) {
    sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 24px; color: #0a0a0a; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 24px; background-color: #ffffff;">
          <h2 style="font-weight: 800; border-bottom: 2px solid #fbda00; padding-bottom: 12px; margin-top: 0;">Lapak UI</h2>
          <p style="font-size: 16px; font-weight: bold; color: #0a0a0a;">${title}</p>
          <p style="font-size: 14px; color: #6b6b6b; line-height: 1.6; margin-bottom: 20px;">${message}</p>
          ${
            link
              ? `<a href="${appUrl}${link}" style="display: inline-block; background-color: #fbda00; color: #000000; font-weight: 700; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px; transition: background-color 200ms ease;">Buka Lapak UI</a>`
              : ""
          }
          <hr style="border: 0; border-top: 1px solid #e5e5e5; margin-top: 32px; margin-bottom: 16px;">
          <p style="font-size: 11px; color: #ababab; text-align: center;">Email ini dikirim secara otomatis oleh sistem Lapak UI — Marketplace & Community Platform for UI Students.</p>
        </div>
      `,
    }).catch((e) => console.error("[EMAIL_NOTIFICATION_ERROR]", e));
  }

  // Kirim melalui Saluran Telegram Bot jika pengguna telah menghubungkan Telegram Chat ID
  if (isTelegramEnabled && user.telegramChatId) {
    const formattedMarkdown = `🔔 *${title}*\n\n${message}\n\n${
      link ? `🔗 [Buka Lapak UI](${appUrl}${link})` : ""
    }`;
    
    sendTelegramMessage(
      Number(user.telegramChatId),
      formattedMarkdown
    ).catch((e) => console.error("[TELEGRAM_NOTIFICATION_ERROR]", e));
  }

  return inAppNotif;
}

// ─── Saluran Email (Client Resend API) ─────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Fallback Mock jika API Key belum terpasang di .env
    console.log(`[EMAIL MOCK] Ke: ${to} | Subjek: ${subject} | Pesan: ${text}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Lapak UI <noreply@lapak-ui.com>",
        to,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend API Error: ${errBody}`);
    }
  } catch (error) {
    console.error("[RESEND_SEND_FAIL]", error);
  }
}

// ─── Saluran Telegram Bot (Telegram Bot API) ───────────────────────────────────

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    // Fallback Mock jika Token Bot belum terpasang di .env
    console.log(`[TELEGRAM MOCK] ChatID: ${chatId} | Pesan: ${text}`);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Telegram API Error: ${errBody}`);
    }
  } catch (error) {
    console.error("[TELEGRAM_SEND_FAIL]", error);
  }
}

// ─── Saluran Google Calendar Integration Helper ────────────────────────────────────────

interface CreateCalendarEventArgs {
  userToken: string;
  summary: string;
  description: string;
  location: string;
  startTime: Date;
  durationMinutes?: number;
}

/**
 * Membuat event baru di Google Calendar milik pengguna secara realtime menggunakan Google Calendar API v3
 * Dipanggil saat COD didefinisikan / disetujui (pada status ON_PROGRESS / cod-schedule)
 */
export async function createGoogleCalendarEvent({
  userToken,
  summary,
  description,
  location,
  startTime,
  durationMinutes = 60,
}: CreateCalendarEventArgs): Promise<string | null> {
  if (!userToken) return null;

  try {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        summary,
        description,
        location,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "Asia/Jakarta",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "Asia/Jakarta",
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.id as string;
    } else {
      const errBody = await res.text();
      console.error("[GOOGLE_CALENDAR_API_FAIL]", errBody);
      return null;
    }
  } catch (error) {
    console.error("[GOOGLE_CALENDAR_EVENT_ERROR]", error);
    return null;
  }
}
