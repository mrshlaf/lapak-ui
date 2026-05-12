"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type WishlistItem = {
  id: string; createdAt: string;
  product: { id: string; title: string; price: number; status: string; images: { imageUrl: string }[]; seller: { name: string } };
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setWishlist(data.wishlist ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRemove = async (productId: string) => {
    await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
    setWishlist(prev => prev.filter(i => i.product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Wishlist" maxWidth="max-w-4xl" />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-8">Wishlist ({wishlist.length})</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="bg-white aspect-[3/4] rounded-2xl animate-pulse" />)}</div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E5]">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Wishlist kosong</h3>
            <p className="text-[#6B6B6B] mb-6">Simpan produk favoritmu dari katalog</p>
            <Link href="/marketplace" className="bg-[#FBDA00] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#FACC15] transition-colors">
              Browse Katalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map(({ product, id }) => (
              <div key={id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden group">
                <Link href={`/marketplace/${product.id}`}>
                  <div className="aspect-[4/3] bg-[#F5F5F5] relative">
                    {product.images[0] ? (
                      <img src={product.images[0].imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-4xl text-[#ABABAB]">📦</div>}
                    {product.status !== "available" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
                          {product.status === "completed" ? "Terjual" : "Tidak Tersedia"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] line-clamp-2 mb-1">{product.title}</h3>
                  <p className="text-sm font-bold text-[#0A0A0A] mb-2">{formatPrice(product.price)}</p>
                  <button onClick={() => handleRemove(product.id)}
                    className="w-full text-xs text-[#ABABAB] hover:text-[#EF4444] transition-colors border border-[#E5E5E5] py-1.5 rounded-xl">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
