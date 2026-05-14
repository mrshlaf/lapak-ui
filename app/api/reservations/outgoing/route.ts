import { prisma } from "@/lib/prisma";
import { requireAuth, ok } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const reservations = await prisma.reservation.findMany({
    where: { buyerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          seller: { select: { id: true, name: true, faculty: true, profilePicture: true, ratingAvg: true } },
        },
      },
    },
  });

  return ok({ reservations });
}
