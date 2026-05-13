import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

async function getTransaction(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      product: { include: { images: { orderBy: { orderIndex: "asc" } } } },
      buyer: { select: { id: true, name: true, faculty: true, profilePicture: true } },
      seller: { select: { id: true, name: true, faculty: true, profilePicture: true } },
      reservation: true,
      reviews: true,
    },
  });
}

// GET /api/transactions/[id]
export async function GET(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const transaction = await getTransaction(id);
  if (!transaction) return err("Transaksi tidak ditemukan.", 404);

  if (transaction.buyerId !== session.userId && transaction.sellerId !== session.userId && session.role !== "admin") {
    return err("Forbidden.", 403);
  }

  return ok({ transaction });
}
