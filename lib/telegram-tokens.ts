const globalForTelegram = global as unknown as {
  telegramTokens?: Map<string, { userId: string; expires: number }>;
};

// Map global yang bertahan dari siklus Hot-Reloading (HMR) Next.js
export const telegramTokens =
  globalForTelegram.telegramTokens ?? new Map<string, { userId: string; expires: number }>();

if (process.env.NODE_ENV !== "production") {
  globalForTelegram.telegramTokens = telegramTokens;
}

/**
 * Menghasilkan token verifikasi acak 6 digit alfanumerik (mengecualikan karakter mirip seperti O, I, 0, 1)
 * Token disimpan secara in-memory selama 10 menit.
 */
export function generateTelegramToken(userId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  telegramTokens.set(token, {
    userId,
    expires: Date.now() + 10 * 60 * 1000, // 10 Menit TTL
  });

  return token;
}

/**
 * Memverifikasi token Telegram yang dimasukkan.
 * Mengembalikan userId jika valid dan menghapusnya dari memori (single-use token).
 */
export function verifyTelegramToken(token: string): string | null {
  const upperToken = token.trim().toUpperCase();
  const data = telegramTokens.get(upperToken);
  if (!data) return null;

  if (Date.now() > data.expires) {
    telegramTokens.delete(upperToken);
    return null;
  }

  telegramTokens.delete(upperToken);
  return data.userId;
}
