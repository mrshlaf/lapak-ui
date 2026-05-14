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
    <div className="min-h-screen bg-[#F5F5F5]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-[#6B6B6B] hover:text-[#0A0A0A] text-sm">← Admin</Link>
          <span className="font-bold text-lg text-[#0A0A0A]">Pantau Transaksi</span>
        </div>
      </nav>

      <div className="pt-16 max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Semua Transaksi ({transactions.length})</h1>

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
    </div>
  );
}
