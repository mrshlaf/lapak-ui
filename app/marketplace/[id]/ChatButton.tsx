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
      {loading ? "Menghubungkan..." : "💬 Chat Seller"}
    </button>
  );
}
