import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { verifySession } from "@/lib/auth";
import ProfileClientView from "../ProfileClientView";

type Params = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Params) {
  const { id } = await params;

  const cacheKey = `profile:${id}`;
  let profileData;

  try {
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) profileData = JSON.parse(cached);
    }
  } catch (e) {
    console.error("Redis error:", e);
  }

  if (!profileData) {
    profileData = await Promise.all([
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

    try {
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(profileData), "EX", 60);
      }
    } catch (e) {
      console.error("Redis set error:", e);
    }
  }

  const [user, products, reviews, comments] = profileData;

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
    ratingAvg: Number(user.ratingAvg || 0),
    ratingCount: user.ratingCount || 0,
    createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt.toISOString(),
    isActive: user.isActive,
    telegramChatId: user.telegramChatId ? user.telegramChatId.toString() : null,
    _count: user._count,
  };

  const serializableProducts = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    images: p.images.map((img: any) => ({ imageUrl: img.imageUrl })),
  }));

  const serializableReviews = reviews.map((r: any) => ({
    id: r.id,
    rating: Number(r.rating || 0),
    comment: r.comment,
    reviewer: {
      name: r.reviewer?.name ?? "Anonim",
      faculty: r.reviewer?.faculty ?? null,
    },
  }));

  const serializableComments = comments.map((c: any) => ({
    id: c.id,
    postId: c.postId,
    content: c.content,
    createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString(),
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
