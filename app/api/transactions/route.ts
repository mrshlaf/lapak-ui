import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

// GET /api/transactions
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") ?? "all"; // buyer | seller | all
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (role === "buyer") where.buyerId = session.userId;
  else if (role === "seller") where.sellerId = session.userId;
  else where.OR = [{ buyerId: session.userId }, { sellerId: session.userId }];
  if (status) where.status = status;

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      buyer: { select: { id: true, name: true, faculty: true, profilePicture: true } },
      seller: { select: { id: true, name: true, faculty: true, profilePicture: true } },
    },
  });

  return ok({ transactions });
}
