import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/posts/[id]
export async function DELETE(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return err("Post tidak ditemukan.", 404);
  if (session.role !== "admin") return err("Forbidden. Hanya admin yang dapat menghapus postingan.", 403);

  await prisma.post.delete({ where: { id } });
  return ok({ message: "Post berhasil dihapus." });
}
