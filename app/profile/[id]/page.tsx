import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import ProfileClientView from "../ProfileClientView";

type Params = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Params) {
  const { id } = await params;

  const [user, products, reviews, comments] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, faculty: true, profilePicture: true,
        ratingAvg: true, ratingCount: true, createdAt: true, isActive: true,
        telegramChatId: true,
        _count: { select: { products: true, transactionsAsBuyer: true, posts: true } },
      },
    }),
    prisma.product.findMany({
      where: { sellerId: id, status: { in: ["available", "reserved"] } },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.review.findMany({
      where: { revieweeId: id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { reviewer: { select: { id: true, name: true, faculty: true } } },
    }),
    prisma.comment.findMany({
      where: { authorId: id },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        post: { select: { id: true, content: true } },
      },
    }),
  ]);

  if (!user) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  const isOwn = session?.userId === id;

  // Transform User data to serialize BigInt & Decimal safely for Client Component
  const serializableUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    faculty: user.faculty,
    profilePicture: user.profilePicture,
    ratingAvg: Number(user.ratingAvg),
    ratingCount: user.ratingCount,
    createdAt: user.createdAt.toISOString(),
    isActive: user.isActive,
    telegramChatId: user.telegramChatId ? user.telegramChatId.toString() : null,
    _count: user._count,
  };

  const serializableProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    images: p.images.map((img) => ({ imageUrl: img.imageUrl })),
  }));

  const serializableReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reviewer: {
      name: r.reviewer?.name ?? "Anonim",
      faculty: r.reviewer?.faculty ?? null,
    },
  }));

  const serializableComments = comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    postContent: c.post?.content ?? "Postingan telah dihapus.",
  }));

  return (
    <ProfileClientView
      initialUser={serializableUser}
      products={serializableProducts}
      reviews={serializableReviews}
      comments={serializableComments}
      isOwn={isOwn}
    />
  );
}
