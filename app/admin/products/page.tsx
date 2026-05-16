"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Product = {
  id: string; title: string; price: number; category: string; status: string; createdAt: string;
  seller: { id: string; name: string };
  images: { imageUrl: string }[];
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="pt-28 max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#0A0A0A] transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </Link>
            Produk Manajemen
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-2">{total} produk terdaftar dalam marketplace.</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#ABABAB]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Cari judul produk..."
            className="w-full bg-white border border-[#E5E5E5] rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#0A0A0A] focus:shadow-md transition-all font-medium" 
          />
        </div>
      </div>
        <div className="space-y-3">
          {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="bg-white h-20 rounded-2xl animate-pulse" />) :
            products.map((p) => (
              <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0">
                  {p.images[0] ? <img src={p.images[0].imageUrl} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#ABABAB]"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/marketplace/${p.id}`} className="font-semibold text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors truncate block">{p.title}</Link>
                  <p className="text-sm text-[#6B6B6B]">{formatPrice(p.price)} · {p.seller.name} · <span className="capitalize">{p.status}</span></p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-sm text-[#EF4444] border border-[#EF4444] px-3 py-1.5 rounded-full hover:bg-[#EF4444] hover:text-white transition-colors shrink-0">
                  Hapus
                </button>
              </div>
            ))}
        </div>
        <div className="flex justify-center gap-3 mt-6">
          {page > 1 && (
            <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-[#E5E5E5] rounded-full text-sm hover:border-[#0A0A0A] transition-all flex items-center gap-1.5 group">
              <svg className="w-3.5 h-3.5 text-[#6B6B6B] group-hover:text-[#0A0A0A] group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Sebelumnya
            </button>
          )}
          {products.length === 20 && (
            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-sm hover:bg-[#1a1a1a] transition-all flex items-center gap-1.5 group">
              Selanjutnya
              <svg className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
    </div>
  );
}
