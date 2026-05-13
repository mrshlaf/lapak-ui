"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  senderId: string | null;
  createdAt: string;
  sender: { id: string; name: string } | null;
};

type ChatDetails = {
  id: string;
  product: { id: string; title: string; price: number; status: string } | null;
  participantA: { id: string; name: string; faculty: string | null } | null;
  participantB: { id: string; name: string; faculty: string | null } | null;
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function ChatDetailPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDetails = useCallback(async () => {
    try {
      const [meRes, chatListRes, msgRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/chats"),
        fetch(`/api/chats/${chatId}/messages`),
      ]);

      const meData = await meRes.json();
      setCurrentUserId(meData.user?.id ?? "");

      if (chatListRes.ok) {
        const chatListData = await chatListRes.json();
        const foundChat = chatListData.chats?.find((c: any) => c.id === chatId);
        setChat(foundChat ?? null);
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.messages ?? []);
      }
    } catch (err) {
      console.error("Gagal mengambil detail chat:", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up auto-refresh polling every 4 seconds to simulate realtime chat
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } catch (err) {
        console.error("Gagal polling pesan:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const contentToSend = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        setNewMessage(contentToSend); // Restore if failed
      }
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#ABABAB]">Memuat percakapan...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
        <div className="text-[#EF4444]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[#0A0A0A] font-semibold text-sm">Percakapan tidak ditemukan</p>
        <Link href="/chat" className="text-xs font-semibold text-[#0A0A0A] bg-white border border-[#E5E5E5] px-4 py-2 rounded-full hover:border-[#0A0A0A] hover:bg-[#FAF9F6]/30 transition-all shadow-sm">Kembali ke Pesan</Link>
      </div>
    );
  }

  const otherUser = chat.participantA?.id === currentUserId ? chat.participantB : chat.participantA;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6 shrink-0 z-50">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              title="Kembali ke Pesan Masuk"
              className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#E5E5E5] bg-white hover:border-[#0A0A0A] hover:bg-[#FAF9F6]/30 hover:shadow-sm transition-all duration-200 active:scale-90 shrink-0 mr-1"
            >
              <svg
                className="w-4.5 h-4.5 text-[#6B6B6B] group-hover:text-[#0A0A0A] group-hover:-translate-x-0.5 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <Link
              href={`/profile/${otherUser?.id}`}
              title={`Lihat Profil ${otherUser?.name}`}
              className="flex items-center gap-3 hover:opacity-80 active:scale-98 transition-all duration-200 cursor-pointer"
            >
              <div className="w-9 h-9 bg-[#FBDA00] rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0 border border-[#E5E5E5] hover:scale-105 transition-all">
                {otherUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] leading-tight">{otherUser?.name}</p>
                <p className="text-[10px] font-semibold text-[#6B6B6B] truncate max-w-[150px] leading-none mt-1">{otherUser?.faculty ?? "Fakultas UI"}</p>
              </div>
            </Link>
          </div>
          {chat.product && (
            <Link href={`/marketplace/${chat.product.id}`} className="text-xs font-semibold bg-[#F5F5F5] hover:bg-[#E5E5E5] border border-[#E5E5E5] text-[#0A0A0A] px-3 py-1.5 rounded-full transition-colors truncate max-w-[150px]">
              {chat.product.title}
            </Link>
          )}
        </div>
      </header>

      {/* Linked Product Bar */}
      {chat.product && (
        <div className="bg-[#FFFBEA]/80 border-b border-[#FBDA00]/20 px-6 py-2.5 shrink-0 z-40 text-center backdrop-blur-sm">
          <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-[#0A0A0A]">
            <span className="font-semibold text-left truncate flex-1 pr-4">Tertarik dengan: <strong className="font-bold">{chat.product.title}</strong></span>
            <span className="font-bold bg-[#FBDA00] text-black px-2 py-0.5 rounded-full whitespace-nowrap">{formatPrice(chat.product.price)}</span>
          </div>
        </div>
      )}

      {/* Message Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-[#ABABAB] text-sm">
              Belum ada pesan. Sapa {otherUser?.name} untuk memulai obrolan!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isMe ? "bg-[#FBDA00] text-black rounded-tr-none font-medium" : "bg-white text-[#0A0A0A] border border-[#E5E5E5] rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-black/50" : "text-[#ABABAB]"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer Footer */}
      <footer className="bg-white border-t border-[#E5E5E5] px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-[#F5F5F5] rounded-full px-5 py-3 text-sm text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:ring-2 focus:ring-[#FBDA00] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-[#FBDA00] hover:bg-[#FACC15] text-black font-semibold px-6 py-3 rounded-full text-sm transition-colors disabled:opacity-50"
            >
              Kirim
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
