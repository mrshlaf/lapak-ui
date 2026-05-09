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
    <Link href={`/marketplace/${product.id}`} className="group bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:border-[#0A0A0A] hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-[#F5F5F5] overflow-hidden shrink-0">
        {product.images[0] ? (
          <img src={product.images[0].imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <StatusBadge status={product.status} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-[#ABABAB] uppercase font-bold tracking-wider mb-1">{product.subCategory ?? product.category}</p>
        <h3 className="font-semibold text-sm text-[#0A0A0A] line-clamp-2 leading-snug mb-2 group-hover:text-black flex-1">{product.title}</h3>
        
        <div className="mt-auto">
          <p className="text-base font-extrabold text-[#0A0A0A]">
            {formatPrice(product.price)}
            {product.isNegotiable && <span className="text-[10px] font-medium text-[#6B6B6B] bg-[#F5F5F5] px-1.5 py-0.5 rounded ml-1.5">Nego</span>}
          </p>
          
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#F5F5F5] text-[11px] text-[#6B6B6B]">
            <div className="flex items-center gap-0.5 font-bold text-[#0A0A0A]">
              <svg className="w-3.5 h-3.5 text-[#FBDA00]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{Number(product.seller.ratingAvg).toFixed(1)}</span>
            </div>
            <span className="truncate max-w-[120px]">{product.facultyLocation ?? "Fakultas UI"}</span>
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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(!!data.user);
      })
      .catch(() => {});
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
      {/* Search Header Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-6">
          <Link href="/dashboard" className="font-bold text-xl tracking-tight text-[#0A0A0A] shrink-0">Lapak UI</Link>
          
          {/* Search Box with SVG icon */}
          <div className="flex-1 max-w-xl relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#ABABAB]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text" 
              placeholder="Cari buku, elektronik, les privat, coding..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#F5F5F5] rounded-full pl-11 pr-5 py-2.5 text-sm text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:ring-2 focus:ring-[#FBDA00] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isLoggedIn && <NotificationBell />}
            <Link href="/sell" className="bg-[#FBDA00] text-black font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#FACC15] transition-colors shrink-0 shadow-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Jual Produk
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Body - Split Screen layout matching Tokopedia/Shopee benchmark */}
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Filter Panel (Sidebar) */}
          <aside className="w-full lg:w-64 bg-white border border-[#E5E5E5] rounded-2xl p-5 shrink-0 sticky top-24">
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
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      category === c 
                        ? "bg-[#FBDA00] text-black" 
                        : "text-[#6B6B6B] hover:bg-[#F5F5F5]"
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
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                        subCategory === sub 
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
            
            {/* Top Toolbar: Sorting controls & total matches */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-lg font-extrabold text-[#0A0A0A] tracking-tight">
                  {category ? (category === "barang" ? "Katalog Barang Bekas" : "Katalog Jasa Mahasiswa") : "Katalog Lapak UI"}
                </h1>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{total} produk ditemukan</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B6B] font-medium">Urutkan:</span>
                <select 
                  value={sort} 
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="bg-[#F5F5F5] text-[#0A0A0A] text-xs font-bold rounded-full px-4 py-2 focus:outline-none border-none cursor-pointer"
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
      </div>
      <Footer />
    </div>
  );
}
