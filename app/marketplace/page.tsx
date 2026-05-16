"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NotificationBell } from "@/components/NotificationBell";

type Product = {
  id: string; title: string; price: number; isNegotiable: boolean;
  category: string; subCategory: string; condition: string; status: string;
  facultyLocation: string; createdAt: string;
  seller: { id: string; name: string; faculty: string; ratingAvg: number };
  images: { imageUrl: string }[];
};

const CATEGORIES = ["barang", "jasa"];
const BARANG_SUBS = ["Elektronik", "Buku", "Alat Tulis", "Pakaian", "Furnitur", "Lainnya"];
const JASA_SUBS = ["Desain", "Les/Tutor", "Fotografi", "Coding", "Lainnya"];

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "reserved") return <span className="absolute top-3 right-3 bg-[#FBDA00] text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">Reserved</span>;
  if (status === "on_progress") return <span className="absolute top-3 right-3 bg-orange-400 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">Proses</span>;
  return null;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/marketplace/${product.id}`} className="group bg-white rounded-[1.5rem] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-[#E5E5E5]/60 hover:border-[#0A0A0A]/20 transition-all duration-500 flex flex-col h-full relative">
      <div className="relative aspect-[4/3] bg-[#F5F5F5] overflow-hidden shrink-0">
        {product.images[0] ? (
          <img src={product.images[0].imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <StatusBadge status={product.status} />
        {/* Subtle gradient overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
        <p className="text-[10px] text-[#ABABAB] uppercase font-black tracking-widest mb-1.5">{product.subCategory ?? product.category}</p>
        <h3 className="font-bold text-base text-[#0A0A0A] line-clamp-2 leading-snug mb-3 group-hover:text-[#6B6B6B] transition-colors flex-1">{product.title}</h3>

        <div className="mt-auto">
          <p className="text-lg font-black text-[#0A0A0A] flex items-center gap-2">
            {formatPrice(product.price)}
            {product.isNegotiable && <span className="text-[9px] font-black uppercase tracking-wider text-[#0A0A0A] bg-[#FBDA00] px-2 py-0.5 rounded-full">Nego</span>}
          </p>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#F5F5F5] text-xs text-[#6B6B6B]">
            <div className="flex items-center gap-1 font-bold text-[#0A0A0A]">
              <svg className="w-4 h-4 text-[#FBDA00]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{Number(product.seller.ratingAvg).toFixed(1)}</span>
            </div>
            <span className="truncate max-w-[120px] font-medium">{product.facultyLocation ?? "Fakultas UI"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(!!data.user);
      })
      .catch(() => { });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), sort });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (subCategory) params.set("subCategory", subCategory);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, category, subCategory, minPrice, maxPrice, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setCategory("");
    setSubCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#FBDA00] selection:text-black">

      {/* Cinematic Hero — full dark bottom for overlap */}
      <div className="relative h-[42vh] min-h-[280px] overflow-hidden bg-[#0A0A0A]">
        <img src="/images/ui-images.jpeg" alt="UI Campus" className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Katalog<br />
                <span className="text-[#FBDA00]">Marketplace.</span>
              </h1>
              <p className="text-white/55 text-xs md:text-sm font-medium mt-2">
                {total > 0 ? `${total} produk tersedia` : "Barang bekas & jasa mahasiswa UI"}
              </p>
            </div>
            {/* Search bar */}
            <div className="flex-1 max-w-md">
              <div className="flex gap-2 group">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Cari produk atau jasa..."
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                />
                <button className="bg-[#FBDA00] text-black font-black px-5 py-3 rounded-2xl hover:bg-[#FFE44D] active:scale-95 transition-all shrink-0 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="pb-16 max-w-7xl mx-auto px-6 w-full mt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: Filter Panel (Sidebar) */}
          <aside className={`w-full lg:w-64 bg-white border border-[#E5E5E5]/60 rounded-3xl p-6 shrink-0 lg:sticky lg:top-28 shadow-sm transition-all duration-300 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5F5F5]">
              <h2 className="font-bold text-sm text-[#0A0A0A]">Filter</h2>
              <button onClick={handleClearFilters} className="text-xs font-semibold text-[#6B6B6B] hover:text-black transition-colors">Hapus Semua</button>
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <h3 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider mb-2.5">Kategori</h3>
              <div className="flex flex-col gap-2">
                {["", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setSubCategory(""); setPage(1); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${category === c
                        ? "bg-[#0A0A0A] text-white shadow-md"
                        : "text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]"
                      }`}
                  >
                    {c === "" ? "Semua Kategori" : c === "barang" ? "Barang Bekas" : "Jasa Mahasiswa"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Category Filter (Based on selected category) */}
            {category && (
              <div className="mb-5 border-t border-[#F5F5F5] pt-4">
                <h3 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider mb-2.5">Sub Kategori</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(category === "barang" ? BARANG_SUBS : JASA_SUBS).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => { setSubCategory(sub === subCategory ? "" : sub); setPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${subCategory === sub
                          ? "bg-black border-black text-white"
                          : "bg-white border-[#E5E5E5] text-[#6B6B6B] hover:border-black hover:text-black"
                        }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter with Apply Button */}
            <form onSubmit={handlePriceApply} className="border-t border-[#F5F5F5] pt-4">
              <h3 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider mb-2.5">Batas Harga</h3>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[10px] text-[#ABABAB] font-bold">Rp</span>
                  <input
                    type="number"
                    placeholder="Harga Minimum"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[10px] text-[#ABABAB] font-bold">Rp</span>
                  <input
                    type="number"
                    placeholder="Harga Maksimum"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[#F5F5F5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0A0A0A] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0A0A0A] text-white hover:bg-black/85 text-xs font-bold py-2 rounded-xl transition-colors mt-2"
                >
                  Terapkan
                </button>
              </div>
            </form>
          </aside>

          {/* Right Column: Grid and Sorters */}
          <main className="flex-1 w-full">

            {/* Toolbar: sort + jual */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#0A0A0A] text-xs font-bold rounded-xl px-4 py-2.5 shadow-sm active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18m-18 7.5h18m-18 7.5h18" />
                </svg>
                {showMobileFilters ? "Tutup Filter" : "Filter"}
              </button>
              <div className="flex items-center gap-3 ml-auto">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="bg-white border border-[#E5E5E5] text-[#0A0A0A] text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer shadow-sm hover:border-[#0A0A0A]/20 transition-colors"
                >
                  <option value="newest">Terbaru</option>
                  <option value="cheapest">Harga: Terendah</option>
                  <option value="expensive">Harga: Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Product Card Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden aspect-[3/4] animate-pulse p-4 flex flex-col justify-between">
                    <div className="bg-[#F5F5F5] rounded-xl flex-1 mb-4" />
                    <div className="h-4 bg-[#F5F5F5] rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#F5F5F5] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-16 text-center flex flex-col items-center justify-center">
                <div className="text-[#ABABAB] mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">Produk Tidak Ditemukan</h3>
                <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">Coba kurangi filter atau masukkan kata kunci pencarian yang lain.</p>
                <button onClick={handleClearFilters} className="bg-[#FBDA00] text-black font-semibold px-6 py-2.5 rounded-full hover:bg-[#FACC15] transition-colors text-xs shadow-sm">
                  Reset Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-4 mt-12 pt-6 border-t border-[#E5E5E5]">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-5 py-2 border border-[#E5E5E5] rounded-full text-xs font-bold text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-bold text-[#0A0A0A]">Halaman {page}</span>
                  <button
                    disabled={products.length < 12}
                    onClick={() => setPage(p => p + 1)}
                    className="px-5 py-2 bg-[#0A0A0A] text-white rounded-full text-xs font-bold hover:bg-black/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
