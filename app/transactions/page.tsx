"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Transaction = {
  id: string; status: string; finalPrice: number; createdAt: string;
  product: { id: string; title: string; images: { imageUrl: string }[] } | null;
  buyer: { id: string; name: string } | null;
  seller: { id: string; name: string } | null;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  on_progress: { label: "Sedang Berlangsung", color: "bg-orange-100 text-orange-700" },
  waiting_buyer_confirm: { label: "Menunggu Konfirmasimu", color: "bg-[#FBDA00] text-black" },
  completed: { label: "Selesai", color: "bg-[#22C55E] text-white" },
  cancelled: { label: "Dibatalkan", color: "bg-[#F5F5F5] text-[#6B6B6B]" },
};

function formatPrice(p: number | null) {
  if (!p) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "buyer" | "seller">("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/transactions?role=${tab}`)
      .then(r => r.json())
      .then(d => { setTransactions(d.transactions ?? []); setLoading(false); });
  }, [tab]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Histori Transaksi" maxWidth="max-w-4xl" />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[["all", "Semua"], ["buyer", "Sebagai Buyer"], ["seller", "Sebagai Seller"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as "all" | "buyer" | "seller")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === v ? "bg-[#0A0A0A] text-white" : "bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]"}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="bg-white h-24 rounded-2xl animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E5]">
            <div className="mb-4 text-gray-400">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Belum ada transaksi</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const s = STATUS_MAP[t.status] ?? { label: t.status, color: "bg-gray-100 text-gray-700" };
              return (
                <Link key={t.id} href={`/transactions/${t.id}`}
                  className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex items-center gap-4 hover:border-[#0A0A0A] transition-colors block">
                  <div className="w-14 h-14 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0">
                    {t.product?.images[0] ? (
                      <img src={t.product.images[0].imageUrl} alt={t.product.title} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0A0A0A] truncate">{t.product?.title ?? "Produk Dihapus"}</h3>
                    <p className="text-sm text-[#6B6B6B]">{formatPrice(t.finalPrice)}</p>
                    <p className="text-xs text-[#ABABAB]">{new Date(t.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                </Link>
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
