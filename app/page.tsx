import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import uiImage from "./images/ui-images.jpeg"; // Assuming this is a nice campus background

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  // Fetch latest products for the e-commerce feel
  const cacheKey = "landing:products";
  let latestProducts;

  try {
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) latestProducts = JSON.parse(cached);
    }
  } catch (e) {
    console.error("Redis get error:", e);
  }

  if (!latestProducts) {
    latestProducts = await prisma.product.findMany({
      where: { status: "available" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        seller: { select: { faculty: true } }
      }
    });

    try {
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(latestProducts), "EX", 60);
      }
    } catch (e) {
      console.error("Redis set error:", e);
    }
  }

  function formatPrice(p: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
  }

  const CATEGORIES = [
    { name: "Pakaian", icon: <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { name: "Elektronik", icon: <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { name: "Buku", icon: <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { name: "Makanan", icon: <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 5v2m8-2v2" /></svg> },
    { name: "Lainnya", icon: <svg className="w-6 h-6 text-[#0A0A0A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> }
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-[#FBDA00] selection:text-black">

      <main className="flex-1"> {/* Cinematic Hero Section */}
        <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <Image 
            src={uiImage} 
            alt="Universitas Indonesia Campus" 
            fill 
            className="object-cover scale-105"
            priority
          />
          {/* Gradients for depth and legibility */}
          <div className="absolute inset-0 bg-[#0A0A0A]/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#FAFAFA]" />
          
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-6 md:mb-8 drop-shadow-2xl">
              Satu Kampus.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBDA00] to-[#FFF8D6]">Semua Kebutuhan.</span>
            </h1>
            
            <p className="text-base md:text-xl text-white/80 mb-10 md:mb-12 max-w-2xl font-medium tracking-wide">
              Marketplace premium khusus mahasiswa UI. Beli, jual, dan temukan apa pun yang kamu cari di lingkungan kampus.
            </p>
            
            {/* Glassmorphism Search Bar */}
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-2 group focus-within:bg-white/20 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/30 transition-all duration-500">
              <div className="pl-4 md:pl-6 text-white/60 group-focus-within:text-white transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Cari buku, jas lab, kosan..."
                className="flex-1 bg-transparent py-3 md:py-4 px-2 md:px-3 outline-none text-white placeholder-white/40 text-sm md:text-lg font-medium"
              />
              <Link 
                href="/marketplace" 
                className="bg-[#FBDA00] text-black px-6 md:px-8 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] font-bold text-sm md:text-lg hover:bg-[#FACC15] hover:scale-[1.02] active:scale-95 transition-all shadow-lg whitespace-nowrap"
              >
                Eksplor
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section - Clean Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 relative z-20 -mt-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map(c => (
              <Link key={c.name} href={`/marketplace?category=${c.name}`} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E5E5]/50 hover:border-[#0A0A0A] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
                <div className="w-14 h-14 rounded-full bg-[#F5F5F5] group-hover:bg-[#FBDA00] flex items-center justify-center transition-colors duration-300">
                  {c.icon}
                </div>
                <span className="text-sm font-bold text-[#0A0A0A]">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Products Section - Premium Cards */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-[#0A0A0A] mb-2">Pilihan Terbaik</h2>
              <p className="text-[#6B6B6B] font-medium">Barang terbaru yang baru saja diunggah.</p>
            </div>
            <Link href="/marketplace" className="hidden md:flex text-[#0A0A0A] font-bold hover:text-[#6B6B6B] transition-colors items-center gap-2 group border-b-2 border-transparent hover:border-[#0A0A0A] pb-1">
              Lihat Katalog 
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestProducts?.map((product: any) => (
              <Link key={product.id} href={`/marketplace/${product.id}`} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-[#E5E5E5]/60 transition-all duration-500">
                <div className="aspect-[4/5] bg-[#F5F5F5] relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0].imageUrl} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">
                    {product.category}
                  </div>
                  
                  {/* Hover Action Button */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
                    <div className="bg-[#0A0A0A] text-white text-sm font-bold text-center py-3.5 rounded-xl w-full shadow-lg flex items-center justify-center gap-2">
                      Lihat Detail
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                  {/* Bottom Gradient for text readability if needed */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 bg-white relative z-20">
                  <h3 className="font-bold text-[#0A0A0A] text-lg leading-snug line-clamp-2 mb-2 group-hover:text-[#6B6B6B] transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#ABABAB] uppercase tracking-widest mb-1">Harga</p>
                      <p className="text-xl font-black text-[#0A0A0A]">{formatPrice(product.price)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#0A0A0A]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 flex justify-center md:hidden">
            <Link href="/marketplace" className="text-[#0A0A0A] font-bold bg-[#F5F5F5] px-8 py-4 rounded-2xl w-full text-center active:scale-95 transition-transform">
              Lihat Semua Katalog
            </Link>
          </div>
        </section>
        
        {/* Ultra Minimal CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 py-24 mb-10">
          <div className="bg-[#0A0A0A] rounded-[3rem] p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            {/* Minimalist Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
            


            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 relative z-10">
              Punya Barang Nganggur?
            </h2>
            <p className="text-[#ABABAB] text-lg md:text-xl max-w-2xl font-medium mb-10 relative z-10">
              Ubah buku bekas, alat tulis, hingga jasa titipmu menjadi penghasilan tambahan dalam hitungan detik. 
            </p>
            <Link href="/sell" className="relative z-10 bg-[#FBDA00] text-[#0A0A0A] px-12 py-5 rounded-full font-black text-lg hover:bg-[#FACC15] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(251,218,0,0.3)] flex items-center gap-3">
              Mulai Jualan Gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
