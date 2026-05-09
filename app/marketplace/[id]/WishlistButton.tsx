"use client";
import { useState } from "react";

export default function WishlistButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    if (added) {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setAdded(false);
    } else {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) setAdded(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
        added 
          ? "bg-[#FBDA00] border-[#FBDA00] text-black" 
          : "border-[#E5E5E5] text-[#ABABAB] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
      }`}
      title={added ? "Hapus dari wishlist" : "Tambah ke wishlist"}
    >
      <svg 
        className="w-5 h-5" 
        fill={added ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
