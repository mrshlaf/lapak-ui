import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

// GET /api/posts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, faculty: true, profilePicture: true } },
        images: { orderBy: { orderIndex: "asc" } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.post.count(),
  ]);

  return ok({ posts, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/posts
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { content, images } = await request.json();
    if (!content || content.trim() === "") return err("Konten post tidak boleh kosong.");

    const post = await prisma.post.create({
      data: { authorId: session.userId, content },
    });

    if (images && images.length > 0) {
      await prisma.postImage.createMany({
        data: images.slice(0, 4).map((url: string, index: number) => ({
          postId: post.id,
          imageUrl: url,
          orderIndex: index,
        })),
      });
    }

    const result = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: { select: { id: true, name: true, faculty: true, profilePicture: true } },
        images: true,
      },
    });

    return ok({ post: result }, 201);
  } catch (e) {
    console.error("[POSTS POST]", e);
    return err("Terjadi kesalahan server.", 500);
  }
}
