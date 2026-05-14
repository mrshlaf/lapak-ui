import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { ok, err } from "@/lib/api";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lapak_session")?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return err("Kamu harus login terlebih dahulu.", 401);
    }

    const body = await request.json();
    const { name, faculty, telegramChatId } = body;

    if (!name || name.trim().length < 2) {
      return err("Nama harus minimal 2 karakter.");
    }

    let parsedTelegramChatId: bigint | null = null;
    if (telegramChatId) {
      try {
        parsedTelegramChatId = BigInt(telegramChatId);
      } catch (e) {
        return err("Telegram Chat ID tidak valid.");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name.trim(),
        faculty: faculty || null,
        telegramChatId: parsedTelegramChatId,
      },
    });

    // Handle BigInt serialization
    const userResponse = {
      ...updatedUser,
      telegramChatId: updatedUser.telegramChatId ? updatedUser.telegramChatId.toString() : null,
    };

    return ok({ user: userResponse });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return err(error.message || "Gagal memperbarui profil.");
  }
}
