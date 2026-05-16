"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Transaction = {
  id: string; status: string; finalPrice: number; codLocation: string | null; codScheduledAt: string | null; createdAt: string;
  product: { title: string } | null;
  buyer: { name: string } | null;
  seller: { name: string } | null;
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Since there's no specific admin transactions route, we can fetch all transactions or create/use standard endpoints
    const res = await fetch("/api/transactions");
    const data = await res.json();
    // Filter/display all of them
    setTransactions(data.transactions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="pt-28 max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#0A0A0A] transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </Link>
            Pantau Transaksi
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-2">{transactions.length} transaksi terdaftar dalam sistem.</p>
        </div>
      </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left bg-[#F5F5F5]">
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Produk</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Seller</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Buyer</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Harga</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Status</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Lokasi COD</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-4 bg-[#F5F5F5] rounded animate-pulse" /></td></tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#ABABAB]">Belum ada data transaksi.</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#0A0A0A]">{t.product?.title ?? "Produk Dihapus"}</td>
                    <td className="px-5 py-3.5 text-[#6B6B6B]">{t.seller?.name ?? "-"}</td>
                    <td className="px-5 py-3.5 text-[#6B6B6B]">{t.buyer?.name ?? "-"}</td>
                    <td className="px-5 py-3.5 font-bold text-[#0A0A0A]">{formatPrice(t.finalPrice)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        t.status === "completed" ? "bg-[#DCFCE7] text-[#166534]" :
                        t.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-[#FFFBEA] text-yellow-800"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#6B6B6B]">{t.codLocation ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
