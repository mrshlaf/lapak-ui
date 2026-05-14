import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

type Params = { params: Promise<{ productId: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { productId } = await params;
  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });
  if (!item) return err("Item tidak ditemukan di wishlist.", 404);

  await prisma.wishlist.delete({ where: { id: item.id } });
  return ok({ message: "Dihapus dari wishlist." });
}
