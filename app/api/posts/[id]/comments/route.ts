import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

type Params = { params: Promise<{ id: string }> };

// GET comments
export async function GET(_: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, faculty: true, profilePicture: true } } },
  });
  return ok({ comments });
}

// POST comment
export async function POST(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return err("Post tidak ditemukan.", 404);

  const { content } = await request.json();
  if (!content) return err("Konten komentar wajib diisi.");

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { postId, authorId: session.userId, content },
      include: { author: { select: { id: true, name: true, faculty: true, profilePicture: true } } },
    }),
    prisma.post.update({ where: { id: postId }, data: { replyCount: { increment: 1 } } }),
  ]);

  if (post.authorId !== session.userId) {
    await sendNotification({
      userId: post.authorId,
      type: "POST_REPLIED",
      title: "Ada yang membalas postinganmu",
      message: `Balasan baru: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
      link: `/community`,
    });
  }

  return ok({ comment }, 201);
}
