import { prisma } from "@/lib/prisma";
import { requireAuth, ok } from "@/lib/api";

export async function PUT() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });

  return ok({ message: "Semua notifikasi ditandai sudah dibaca." });
}
