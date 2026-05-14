"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Chat = {
  id: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  product: { id: string; title: string; price: number; images: { imageUrl: string }[] } | null;
  participantA: { id: string; name: string; faculty: string | null; profilePicture: string | null } | null;
  participantB: { id: string; name: string; faculty: string | null; profilePicture: string | null } | null;
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}d lalu`;
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, chatsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/chats"),
        ]);
        const meData = await meRes.json();
        const chatsData = await chatsRes.json();
        setCurrentUserId(meData.user?.id ?? "");
        setChats(chatsData.chats ?? []);
      } catch (err) {
        console.error("Gagal memuat chat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader title="Pesan Masuk" maxWidth="max-w-3xl" />

      <div className="pt-24 max-w-3xl w-full mx-auto px-6 pb-16 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Chat Saya</h1>

        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse border border-[#E5E5E5]" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-12 text-center flex-1 flex flex-col items-center justify-center my-4">
            <div className="text-[#ABABAB] mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">Belum ada obrolan</h3>
            <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">Mulai tanyakan barang atau jasa melalui halaman detail produk.</p>
            <Link href="/marketplace" className="bg-[#FBDA00] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#FACC15] transition-colors text-sm shadow-sm">
              Temukan Produk
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden divide-y divide-[#F5F5F5]">
            {chats.map((chat) => {
              const otherUser = chat.participantA?.id === currentUserId ? chat.participantB : chat.participantA;
              if (!otherUser) return null;

              return (
                <Link key={chat.id} href={`/chat/${chat.id}`} className="block p-5 hover:bg-[#FFFBEA]/40 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* User Avatar - Navigate to Profile */}
                    <div
                      title={`Lihat Profil ${otherUser.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/profile/${otherUser.id}`;
                      }}
                      className="w-12 h-12 bg-[#FBDA00] rounded-full flex items-center justify-center text-black font-bold shrink-0 text-base hover:scale-105 hover:opacity-90 active:scale-95 cursor-pointer transition-all border border-[#E5E5E5] shadow-sm z-10"
                    >
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-[#0A0A0A] truncate">{otherUser.name}</span>
                        {chat.lastMessageAt && (
                          <span className="text-xs text-[#ABABAB] shrink-0">{timeAgo(chat.lastMessageAt)}</span>
                        )}
                      </div>

                      <p className="text-xs text-[#6B6B6B] mb-2 truncate font-medium">{otherUser.faculty ?? "Fakultas UI"}</p>

                      {/* Last Message */}
                      <p className="text-sm text-[#6B6B6B] truncate mb-2">
                        {chat.lastMessage ?? "Belum ada pesan."}
                      </p>

                      {/* Linked Product Badge */}
                      {chat.product && (
                        <div className="inline-flex items-center gap-2 bg-[#F5F5F5] rounded-xl px-2.5 py-1.5 border border-[#E5E5E5] mt-1">
                          <span className="text-xs font-semibold text-[#0A0A0A] truncate max-w-[150px]">{chat.product.title}</span>
                          <span className="text-xs text-[#ABABAB]">|</span>
                          <span className="text-xs font-bold text-[#0A0A0A]">{formatPrice(chat.product.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
