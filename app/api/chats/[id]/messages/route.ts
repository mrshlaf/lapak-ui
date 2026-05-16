import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";
import { sendNotification } from "@/lib/notification";

type Params = { params: Promise<{ id: string }> };

// GET /api/chats/[id]/messages
export async function GET(_: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id: chatId } = await params;

  // Validate participation
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    return err("Chat tidak ditemukan.", 404);
  }

  if (chat.participantAId !== session.userId && chat.participantBId !== session.userId) {
    return err("Forbidden.", 403);
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  // Mark all unread messages from other user as read
  await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: session.userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return ok({ messages });
}

// POST /api/chats/[id]/messages
export async function POST(request: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id: chatId } = await params;

  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return err("Pesan tidak boleh kosong.", 400);
    }

    // Validate participation
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return err("Chat tidak ditemukan.", 404);
    }

    if (chat.participantAId !== session.userId && chat.participantBId !== session.userId) {
      return err("Forbidden.", 403);
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          chatId,
          senderId: session.userId,
          content: content.trim(),
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });

      await tx.chat.update({
        where: { id: chatId },
        data: {
          lastMessage: content.trim(),
          lastMessageAt: new Date(),
        },
      });

      return msg;
    });

    // Cari ID Penerima Chat
    const recipientId = chat.participantAId === session.userId ? chat.participantBId : chat.participantAId;

    if (recipientId) {
      await sendNotification({
        userId: recipientId,
        type: "CHAT_MESSAGE",
        title: `Pesan baru dari ${message.sender?.name || "Seseorang"}`,
        message: content.trim(),
        link: `/chat/${chatId}`,
      }).catch((err) => console.error("[CHAT_TELEGRAM_NOTIF_ERROR]", err));
    }

    return ok({ message });
  } catch (e: any) {
    return err(e.message || "Gagal mengirim pesan.", 400);
  }
}
