import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

// POST /api/reservations
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { productId, note } = await request.json();
    if (!productId) return err("productId wajib diisi.");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return err("Produk tidak ditemukan.", 404);
    if (product.status !== "available") return err("Produk tidak tersedia untuk direservasi.");
    if (product.sellerId === session.userId) return err("Tidak bisa mereservasi produk sendiri.");

    const expiresAt = new Date(Date.now() + product.reservationDuration * 60 * 60 * 1000);
    const redisKey = `reservation:${productId}:${session.userId}`;

    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          productId,
          buyerId: session.userId,
          status: "pending",
          expiresAt,
          redisKey,
          note,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { status: "reserved" },
      }),
    ]);

    // Kirim notifikasi multi-channel setelah database berhasil diperbarui
    await sendNotification({
      userId: product.sellerId,
      type: "RESERVATION_RECEIVED",
      title: "Ada yang mereservasi produkmu!",
      message: `Seseorang mereservasi "${product.title}"`,
      link: `/reservations/incoming`,
    });

    return ok({ reservation }, 201);
  } catch (e) {
    console.error("[RESERVATIONS POST]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
