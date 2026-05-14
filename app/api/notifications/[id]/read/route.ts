import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== session.userId) return err("Notifikasi tidak ditemukan.", 404);

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return ok({ message: "Notifikasi ditandai sudah dibaca." });
}
