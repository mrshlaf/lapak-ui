import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

type Params = { params: Promise<{ id: string; action: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id, action } = await params;
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!transaction) return err("Transaksi tidak ditemukan.", 404);

  try {
    if (action === "seller-confirm") {
      if (transaction.sellerId !== session.userId) return err("Forbidden.", 403);
      if (transaction.status !== "on_progress") return err("Status transaksi tidak valid.");

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: { status: "waiting_buyer_confirm", sellerConfirmedAt: new Date() },
        }),
      ]);

      // Kirim notifikasi multi-channel setelah database berhasil diperbarui
      await sendNotification({
        userId: transaction.buyerId!,
        type: "COD_SELLER_CONFIRMED",
        title: "Seller mengkonfirmasi COD selesai",
        message: `Konfirmasi transaksi "${transaction.product?.title}" untuk menyelesaikannya`,
        link: `/transactions/${id}`,
      });

      return ok({ message: "Konfirmasi seller berhasil." });
    }

    if (action === "buyer-confirm") {
      if (transaction.buyerId !== session.userId) return err("Forbidden.", 403);
      if (transaction.status !== "waiting_buyer_confirm") return err("Menunggu konfirmasi seller terlebih dahulu.");

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: { status: "completed", buyerConfirmedAt: new Date() },
        }),
        prisma.product.update({
          where: { id: transaction.productId! },
          data: { status: "completed" },
        }),
      ]);

      // Kirim notifikasi multi-channel setelah database berhasil diperbarui
      await sendNotification({
        userId: transaction.sellerId!,
        type: "COD_COMPLETED",
        title: "Transaksi selesai!",
        message: `Buyer mengkonfirmasi transaksi "${transaction.product?.title}"`,
        link: `/transactions/${id}`,
      });

      return ok({ message: "Transaksi selesai." });
    }

    if (action === "cod-schedule") {
      if (transaction.buyerId !== session.userId && transaction.sellerId !== session.userId) {
        return err("Forbidden.", 403);
      }
      const body = await request.json();
      await prisma.transaction.update({
        where: { id },
        data: { codLocation: body.codLocation, codScheduledAt: body.codScheduledAt ? new Date(body.codScheduledAt) : undefined },
      });
      return ok({ message: "Jadwal COD diperbarui." });
    }

    return err("Action tidak valid.", 400);
  } catch (e) {
    console.error("[TRANSACTION ACTION]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
