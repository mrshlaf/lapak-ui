import { prisma } from "@/lib/prisma";
import { requireAdmin, ok } from "@/lib/api";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [userCount, productCount, transactionCount, postCount, completedCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.transaction.count(),
      prisma.post.count(),
      prisma.transaction.count({ where: { status: "completed" } }),
    ]);

  return ok({ stats: { userCount, productCount, transactionCount, postCount, completedCount } });
}
