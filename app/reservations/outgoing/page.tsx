"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Reservation = {
  id: string; status: string; expiresAt: string; createdAt: string;
  product: {
    id: string; title: string; price: number; images: { imageUrl: string }[];
    seller: { id: string; name: string; faculty: string; ratingAvg: number };
  };
};

const STATUS_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: "Menunggu Seller", color: "bg-[#FBDA00] text-black", emoji: "⏳" },
  accepted: { label: "Diterima", color: "bg-[#22C55E] text-white", emoji: "✅" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700", emoji: "❌" },
  cancelled: { label: "Dibatalkan", color: "bg-[#F5F5F5] text-[#6B6B6B]", emoji: "🚫" },
  expired: { label: "Kedaluwarsa", color: "bg-[#F5F5F5] text-[#ABABAB]", emoji: "⌛" },
  completed: { label: "Selesai", color: "bg-[#22C55E] text-white", emoji: "🎉" },
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function OutgoingReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/reservations/outgoing");
    const data = await res.json();
    setReservations(data.reservations ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Batalkan reservasi ini?")) return;
    await fetch(`/api/reservations/${id}/cancel`, { method: "PUT" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Reservasi Saya" maxWidth="max-w-4xl" />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-8">Reservasi Saya ({reservations.length})</h1>

        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="bg-white h-32 rounded-2xl animate-pulse" />)}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E5]">
            <div className="text-5xl mb-4">🕐</div>
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Belum ada reservasi</h3>
            <p className="text-[#6B6B6B] mb-6">Cari produk dan buat reservasi pertamamu</p>
            <Link href="/marketplace" className="bg-[#FBDA00] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#FACC15] transition-colors">
              Browse Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const s = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-700", emoji: "?" };
              const expires = new Date(r.expiresAt);
              const isExpired = expires < new Date();
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0">
                      {r.product.images[0] ? (
                        <img src={r.product.images[0].imageUrl} alt={r.product.title} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/marketplace/${r.product.id}`} className="font-semibold text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors">{r.product.title}</Link>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.emoji} {s.label}</span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-1">{formatPrice(r.product.price)}</p>
                      <p className="text-sm text-[#6B6B6B]">
                        Seller: <span className="text-[#0A0A0A] font-medium">{r.product.seller.name}</span> · ⭐ {Number(r.product.seller.ratingAvg).toFixed(1)}
                      </p>
                      {!isExpired && r.status === "pending" && (
                        <p className="text-xs text-[#ABABAB] mt-1">Berakhir: {expires.toLocaleString("id-ID")}</p>
                      )}
                    </div>
                  </div>
                  {["pending", "accepted"].includes(r.status) && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-[#F5F5F5]">
                      {r.status === "accepted" && (
                        <Link href="/transactions" className="flex-1 bg-[#FBDA00] text-black font-semibold py-2.5 rounded-xl text-center hover:bg-[#FACC15] transition-colors text-sm">
                          Lihat Transaksi
                        </Link>
                      )}
                      <button onClick={() => handleCancel(r.id)}
                        className="flex-1 border border-[#E5E5E5] text-[#6B6B6B] font-semibold py-2.5 rounded-xl hover:border-[#EF4444] hover:text-[#EF4444] transition-colors text-sm">
                        Batalkan
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
