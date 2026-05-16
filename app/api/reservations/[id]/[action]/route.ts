import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

type Params = { params: Promise<{ id: string; action: string }> };

async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: { product: true, buyer: true },
  });
}

// PUT /api/reservations/[id]/accept
export async function PUT(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id, action } = await params;
  const reservation = await getReservation(id);
  if (!reservation) return err("Reservasi tidak ditemukan.", 404);

  try {
    if (action === "accept") {
      if (reservation.product.sellerId !== session.userId) return err("Forbidden.", 403);
      if (reservation.status !== "pending") return err("Reservasi sudah tidak dalam status pending.");

      const [updatedReservation] = await prisma.$transaction([
        prisma.reservation.update({ where: { id }, data: { status: "accepted" } }),
        prisma.product.update({ where: { id: reservation.productId }, data: { status: "on_progress" } }),
        prisma.transaction.create({
          data: {
            reservationId: id,
            productId: reservation.productId,
            buyerId: reservation.buyerId,
            sellerId: reservation.product.sellerId,
            finalPrice: reservation.product.price,
            status: "on_progress",
          },
        }),
      ]);

      // Kirim notifikasi multi-channel setelah database berhasil diperbarui
      await sendNotification({
        userId: reservation.buyerId,
        type: "RESERVATION_ACCEPTED",
        title: "Reservasimu diterima!",
        message: `Seller menerima reservasi "${reservation.product.title}"`,
        link: `/reservations/outgoing`,
      });

      return ok({ reservation: updatedReservation });
    }

    if (action === "reject") {
      if (reservation.product.sellerId !== session.userId) return err("Forbidden.", 403);
      if (reservation.status !== "pending") return err("Reservasi sudah tidak dalam status pending.");

      await prisma.$transaction([
        prisma.reservation.update({ where: { id }, data: { status: "rejected" } }),
        prisma.product.update({ where: { id: reservation.productId }, data: { status: "available" } }),
      ]);

      // Kirim notifikasi multi-channel setelah database berhasil diperbarui
      await sendNotification({
        userId: reservation.buyerId,
        type: "RESERVATION_REJECTED",
        title: "Reservasimu ditolak",
        message: `Seller menolak reservasi "${reservation.product.title}"`,
        link: `/reservations/outgoing`,
      });

      return ok({ message: "Reservasi ditolak." });
    }

    if (action === "cancel") {
      if (reservation.buyerId !== session.userId) return err("Forbidden.", 403);
      if (!["pending", "accepted"].includes(reservation.status)) {
        return err("Reservasi tidak dapat dibatalkan.");
      }

      await prisma.$transaction([
        prisma.reservation.update({ where: { id }, data: { status: "cancelled" } }),
        prisma.product.update({ where: { id: reservation.productId }, data: { status: "available" } }),
      ]);

      return ok({ message: "Reservasi dibatalkan." });
    }

    return err("Action tidak valid.", 400);
  } catch (e) {
    console.error("[RESERVATION ACTION]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
