import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

type Params = { params: Promise<{ id: string }> };

// POST /api/posts/[id]/like — toggle
export async function POST(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return err("Post tidak ditemukan.", 404);

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: session.userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return ok({ liked: false });
  } else {
    await prisma.$transaction([
      prisma.like.create({ data: { postId, userId: session.userId } }),
      prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
    ]);

    if (post.authorId !== session.userId) {
      await sendNotification({
        userId: post.authorId,
        type: "POST_LIKED",
        title: "Postinganmu disukai",
        message: "Seseorang menyukai postinganmu di forum komunitas",
        link: `/community`,
      });
    }

    return ok({ liked: true });
  }
}
