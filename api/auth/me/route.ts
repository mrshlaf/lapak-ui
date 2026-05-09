import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      role: true,
      profilePicture: true,
      ratingAvg: true,
      ratingCount: true,
      telegramChatId: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  const serializedUser = {
    ...user,
    telegramChatId: user.telegramChatId ? user.telegramChatId.toString() : null,
  };

  return NextResponse.json({ user: serializedUser }, { status: 200 });
}
