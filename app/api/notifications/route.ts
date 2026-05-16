import { prisma } from "@/lib/prisma";
import { requireAuth, ok } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const cacheKey = `notifications:${session.userId}`;
  try {
    const { redis } = await import("@/lib/redis");
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return ok(JSON.parse(cached));
    }
  } catch (e) { console.error(e); }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    }),
  ]);

  const result = { notifications, unreadCount };
  
  try {
    const { redis } = await import("@/lib/redis");
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 10); // Short cache for polling
    }
  } catch (e) { console.error(e); }

  return ok(result);
}
