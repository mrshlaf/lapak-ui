import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, err } from "@/lib/api";

// GET /api/chats
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { participantAId: session.userId },
        { participantBId: session.userId },
      ],
    },
    orderBy: { lastMessageAt: "desc" },
    include: {
      product: { select: { id: true, title: true, price: true, images: { take: 1 } } },
      participantA: { select: { id: true, name: true, faculty: true, profilePicture: true } },
      participantB: { select: { id: true, name: true, faculty: true, profilePicture: true } },
    },
  });

  const unreadCount = await prisma.message.count({
    where: {
      chat: {
        OR: [
          { participantAId: session.userId },
          { participantBId: session.userId },
        ],
      },
      senderId: { not: session.userId },
      isRead: false,
    },
  });

  return ok({ chats, unreadCount });
}

// POST /api/chats
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { productId, receiverId } = await request.json();

    if (!receiverId) {
      return err("Receiver ID diperlukan.", 400);
    }

    if (receiverId === session.userId) {
      return err("Kamu tidak bisa chat dengan diri sendiri.", 400);
    }

    // Check if chat already exists between these participants (regardless of product)
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { participantAId: session.userId, participantBId: receiverId },
          { participantAId: receiverId, participantBId: session.userId },
        ],
      },
    });

    if (chat) {
      // If product changed, update it so the chat banner updates to the latest product they are discussing!
      if (productId && chat.productId !== productId) {
        chat = await prisma.chat.update({
          where: { id: chat.id },
          data: { productId },
        });
      }
    } else {
      chat = await prisma.chat.create({
        data: {
          productId,
          participantAId: session.userId,
          participantBId: receiverId,
        },
      });
    }

    return ok({ chat });
  } catch (e: any) {
    return err(e.message || "Gagal memulai chat.", 400);
  }
}
