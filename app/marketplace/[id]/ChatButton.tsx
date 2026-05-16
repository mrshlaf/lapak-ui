"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ChatButtonProps = {
  productId: string;
  sellerId: string;
};

export default function ChatButton({ productId, sellerId }: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, receiverId: sellerId }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.chat.id}`);
      } else {
        alert("Gagal memulai percakapan.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      alert("Terjadi kesalahan teknis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleChat}
      disabled={loading}
      className="flex-1 border border-[#0A0A0A] text-[#0A0A0A] font-semibold py-3.5 rounded-2xl text-center hover:bg-[#0A0A0A] hover:text-white transition-colors text-sm disabled:opacity-50"
    >
      {loading ? "Menghubungkan..." : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Chat Seller
        </span>
      )}
    </button>
  );
}
