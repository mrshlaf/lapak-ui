"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Reservation = {
  id: string; status: string; expiresAt: string; note: string; createdAt: string;
  product: { id: string; title: string; price: number; images: { imageUrl: string }[] };
  buyer: { id: string; name: string; faculty: string; profilePicture: string | null; ratingAvg: number };
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "bg-[#FBDA00] text-black" },
  accepted: { label: "Diterima", color: "bg-[#22C55E] text-white" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan", color: "bg-[#F5F5F5] text-[#6B6B6B]" },
  expired: { label: "Kedaluwarsa", color: "bg-[#F5F5F5] text-[#ABABAB]" },
  completed: { label: "Selesai", color: "bg-[#22C55E] text-white" },
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function IncomingReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/reservations/incoming");
    const data = await res.json();
    setReservations(data.reservations ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    await fetch(`/api/reservations/${id}/${action}`, { method: "PUT" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Reservasi Masuk" maxWidth="max-w-4xl" />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-8">Reservasi Masuk ({reservations.length})</h1>

        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="bg-white h-32 rounded-2xl animate-pulse" />)}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E5]">
            <div className="mb-4 text-gray-400">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Belum ada reservasi</h3>
            <p className="text-[#6B6B6B]">Reservasi dari buyer akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const s = STATUS_MAP[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-700" };
              const expires = new Date(r.expiresAt);
              const isExpired = expires < new Date();
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0">
                      {r.product.images[0] ? (
                        <img src={r.product.images[0].imageUrl} alt={r.product.title} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[#0A0A0A]">{r.product.title}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-2">{formatPrice(r.product.price)}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#FBDA00] rounded-full flex items-center justify-center text-xs font-bold">
                          {r.buyer.name.charAt(0)}
                        </div>
                        <p className="text-sm text-[#0A0A0A] font-medium">{r.buyer.name}</p>
                        <span className="text-[#ABABAB]">·</span>
                        <p className="text-sm text-[#6B6B6B]">{r.buyer.faculty}</p>
                        <p className="text-sm text-[#6B6B6B]">· ⭐ {Number(r.buyer.ratingAvg).toFixed(1)}</p>
                      </div>
                      {r.note && <p className="text-sm text-[#6B6B6B] mt-2 bg-[#F5F5F5] rounded-xl px-3 py-2">"{r.note}"</p>}
                      <p className="text-xs text-[#ABABAB] mt-2">
                        Kedaluwarsa: {isExpired ? "Sudah kedaluwarsa" : expires.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  {r.status === "pending" && !isExpired && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-[#F5F5F5]">
                      <button onClick={() => handleAction(r.id, "accept")}
                        className="flex-1 bg-[#FBDA00] text-black font-semibold py-2.5 rounded-xl hover:bg-[#FACC15] transition-colors text-sm">
                        Terima Reservasi
                      </button>
                      <button onClick={() => handleAction(r.id, "reject")}
                        className="flex-1 border border-[#E5E5E5] text-[#6B6B6B] font-semibold py-2.5 rounded-xl hover:border-[#EF4444] hover:text-[#EF4444] transition-colors text-sm">
                        Tolak
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
