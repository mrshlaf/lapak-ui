import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ok } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, faculty: true, role: true,
        isActive: true, ratingAvg: true, ratingCount: true, createdAt: true,
        _count: { select: { products: true, transactionsAsBuyer: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return ok({ users, total, page, totalPages: Math.ceil(total / limit) });
}
