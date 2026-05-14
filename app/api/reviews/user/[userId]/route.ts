import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return err("User tidak ditemukan.", 404);

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, name: true, faculty: true, profilePicture: true } },
    },
  });

  return ok({ reviews });
}
