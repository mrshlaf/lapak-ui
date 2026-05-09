import { NextRequest } from "next/server";
import { requireAuth, ok, err } from "@/lib/api";
import { generateTelegramToken } from "@/lib/telegram-tokens";

/**
 * GET /api/auth/telegram-connect
 * Endpoint untuk memicu proses penyambungan Telegram Bot.
 * Menghasilkan token acak sementara dan merancang tautan deep-link t.me dengan parameter start=[token]
 */
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const token = generateTelegramToken(session.userId);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "lapakui_bot";
    const connectUrl = `https://t.me/${botUsername}?start=${token}`;

    return ok({
      token,
      connectUrl,
    });
  } catch (e) {
    console.error("[TELEGRAM CONNECT GET]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
