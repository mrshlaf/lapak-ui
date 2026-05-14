import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;
  const items = await prisma.wishlist.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          seller: { select: { id: true, name: true } },
        },
      },
    },
  });
  return ok({ wishlist: items });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { productId } = await request.json();
  if (!productId) return err("productId wajib diisi.");

  const exists = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
  });
  if (exists) return err("Sudah ada di wishlist.", 409);

  const item = await prisma.wishlist.create({
    data: { userId: session.userId, productId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });
  return ok({ item }, 201);
}
