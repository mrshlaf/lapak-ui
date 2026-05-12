import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { transactionId, rating, comment } = await request.json();
    if (!transactionId || !rating) return err("transactionId dan rating wajib diisi.");
    if (rating < 1 || rating > 5) return err("Rating harus antara 1-5.");

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { reviews: true },
    });
    if (!transaction) return err("Transaksi tidak ditemukan.", 404);
    if (transaction.buyerId !== session.userId) return err("Hanya buyer yang bisa memberikan review.");
    if (transaction.status !== "completed") return err("Review hanya bisa diberikan setelah transaksi selesai.");

    const alreadyReviewed = transaction.reviews.some((r) => r.reviewerId === session.userId);
    if (alreadyReviewed) return err("Kamu sudah memberikan review untuk transaksi ini.", 409);

    const review = await prisma.review.create({
      data: {
        transactionId,
        reviewerId: session.userId,
        revieweeId: transaction.sellerId!,
        rating,
        comment,
      },
    });

    // Update seller rating average
    const allReviews = await prisma.review.findMany({
      where: { revieweeId: transaction.sellerId! },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.user.update({
      where: { id: transaction.sellerId! },
      data: { ratingAvg: avgRating, ratingCount: allReviews.length },
    });

    return ok({ review }, 201);
  } catch (e) {
    console.error("[REVIEWS POST]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
