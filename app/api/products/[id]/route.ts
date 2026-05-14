import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true, name: true, faculty: true, profilePicture: true,
          ratingAvg: true, ratingCount: true, createdAt: true,
        },
      },
      images: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!product) return err("Produk tidak ditemukan.", 404);

  // Increment view count
  await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return ok({ product });
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return err("Produk tidak ditemukan.", 404);
  if (product.sellerId !== session.userId && session.role !== "admin") {
    return err("Forbidden.", 403);
  }

  try {
    const body = await request.json();
    
    // Update product fields
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price !== undefined ? parseInt(body.price) : undefined,
        isNegotiable: body.isNegotiable,
        subCategory: body.subCategory,
        condition: body.condition,
        reservationDuration: body.reservationDuration,
        codLocation: body.codLocation,
        facultyLocation: body.facultyLocation,
      },
    });

    // Update images if provided
    if (body.images && body.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: body.images.map((url: string, index: number) => ({
          productId: id,
          imageUrl: url,
          isPrimary: index === 0,
          orderIndex: index,
        })),
      });
    }

    const result = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { orderIndex: "asc" } } },
    });

    return ok({ product: result });
  } catch (e) {
    console.error("[PRODUCTS PUT]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}

// DELETE /api/products/[id]
export async function DELETE(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return err("Produk tidak ditemukan.", 404);
  if (product.sellerId !== session.userId && session.role !== "admin") {
    return err("Forbidden.", 403);
  }

  await prisma.product.delete({ where: { id } });
  return ok({ message: "Produk berhasil dihapus." });
}
