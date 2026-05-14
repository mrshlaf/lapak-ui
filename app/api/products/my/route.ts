import { prisma } from "@/lib/prisma";
import { requireAuth, ok } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const products = await prisma.product.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      _count: { select: { reservations: true } },
    },
  });

  return ok({ products });
}
