import { prisma } from "@/lib/prisma";
import { requireAuth, ok } from "@/lib/api";

export async function PUT() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });

  // Invalidate Cache
  try {
    const { redis } = await import("@/lib/redis");
    if (redis) {
      await redis.del(`notifications:${session.userId}`);
    }
  } catch (e) { console.error(e); }

  return ok({ message: "Semua notifikasi ditandai sudah dibaca." });
}
