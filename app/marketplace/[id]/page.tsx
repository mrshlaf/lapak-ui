import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { Footer } from "@/components/Footer";
import { verifySession } from "@/lib/auth";
import ReserveButton from "./ReserveButton";
import WishlistButton from "./WishlistButton";
import ChatButton from "./ChatButton";

type Params = { params: Promise<{ id: string }> };

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  available: { label: "Tersedia", color: "bg-[#22C55E] text-white" },
  reserved: { label: "Reserved", color: "bg-[#FBDA00] text-black" },
  on_progress: { label: "Sedang Proses", color: "bg-orange-400 text-white" },
  completed: { label: "Terjual", color: "bg-[#6B6B6B] text-white" },
  cancelled: { label: "Dibatalkan", color: "bg-[#EF4444] text-white" },
};

const CONDITION_MAP: Record<string, string> = {
  baru: "Baru",
  bekas_mulus: "Bekas - Mulus",
  bekas_normal: "Bekas - Normal",
};

export default async function ProductDetailPage({ params }: Params) {
  const { id } = await params;

  const cacheKey = `product:${id}`;
  let product;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) product = JSON.parse(cached);
  } catch (e) {
    console.error("Redis get error:", e);
  }

  if (!product) {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, faculty: true, profilePicture: true, ratingAvg: true, ratingCount: true, createdAt: true },
        },
        images: { orderBy: { orderIndex: "asc" } },
      },
    });

    if (product) {
      try {
        await redis.set(cacheKey, JSON.stringify(product), "EX", 30);
      } catch (e) {
        console.error("Redis set error:", e);
      }
    }
  }

  if (!product) notFound();

  // Increment view count
  await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  // Get current user session
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  const isOwner = session?.userId === product.sellerId;
  const isLoggedIn = !!session;

  let currentUser = null;
  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (isLoggedIn && session) {
    currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });
    unreadNotificationsCount = await prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    });
    unreadMessagesCount = await prisma.message.count({
      where: {
        chat: {
          OR: [
            { participantAId: session.userId },
            { participantBId: session.userId },
          ],
        },
        senderId: { not: session.userId },
        isRead: false,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans selection:bg-[#FBDA00] selection:text-black">
      <div className="pb-16">

      <div className="pt-24 max-w-6xl mx-auto px-6">
        {/* Main Glassmorphic/Premium Container Card */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Interactive Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] bg-[#F5F5F5] rounded-2xl overflow-hidden border border-[#E5E5E5] relative group shadow-inner">
              {product.images[0] ? (
                <img 
                  src={product.images[0].imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#ABABAB]">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              {/* Subtle overlay gradient on image hover */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1).map((img: any, i: number) => (
                  <div key={i} className="aspect-square bg-[#F5F5F5] rounded-xl overflow-hidden border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors cursor-pointer group/thumb">
                    <img src={img.imageUrl} alt={`${product.title} ${i + 2}`} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Premium Product Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Condition and Status Badges with Pulse Effects */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {product.status === "available" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tersedia
                  </span>
                ) : (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    product.status === "reserved" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    product.status === "on_progress" ? "bg-orange-50 text-orange-700 border-orange-200" :
                    "bg-gray-100 text-gray-700 border-gray-300"
                  }`}>
                    {STATUS_MAP[product.status]?.label ?? product.status}
                  </span>
                )}

                {product.condition && (
                  <span className="text-xs font-bold text-[#6B6B6B] bg-[#F5F5F5] px-3 py-1.5 rounded-full border border-transparent">
                    Kondisi: {CONDITION_MAP[product.condition] ?? product.condition}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A0A0A] tracking-tight leading-tight mb-4">{product.title}</h1>

              {/* Price Container */}
              <div className="bg-[#F5F5F5]/40 rounded-2xl p-5 border border-[#E5E5E5]/60 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[#ABABAB] text-xs font-semibold uppercase tracking-wider mb-1">Harga Pas</p>
                  <span className="text-3xl md:text-4xl font-black text-[#0A0A0A]">{formatPrice(product.price)}</span>
                </div>
                {product.isNegotiable && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FBDA00]/10 text-black px-3 py-1.5 rounded-xl border border-[#FBDA00]/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Bisa Nego
                  </span>
                )}
              </div>

              {product.description && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-sm font-extrabold text-[#0A0A0A] uppercase tracking-wider">Deskripsi Produk</h3>
                  <p className="text-[#6B6B6B] leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Grid of Attributes */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-sm">
                {product.codLocation && (
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                    <span className="text-[#0A0A0A] shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    <div>
                      <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Lokasi COD</p>
                      <p className="font-semibold text-[#0A0A0A] leading-snug">{product.codLocation}</p>
                    </div>
                  </div>
                )}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-[#0A0A0A] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  <div>
                    <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Masa Reservasi</p>
                    <p className="font-semibold text-[#0A0A0A]">{product.reservationDuration} Jam</p>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-[#0A0A0A] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </span>
                  <div>
                    <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Kategori</p>
                    <p className="font-semibold text-[#0A0A0A] capitalize leading-snug">{product.subCategory ?? product.category}</p>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-[#0A0A0A] shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </span>
                  <div>
                    <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Dilihat</p>
                    <p className="font-semibold text-[#0A0A0A]">{product.viewCount} Kali</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Premium Seller Profile Card with Verified Checkmark */}
              <Link href={`/profile/${product.seller.id}`}
                className="flex items-center gap-4 p-4 border border-[#E5E5E5] rounded-2xl mb-6 hover:border-[#0A0A0A] hover:shadow-sm bg-[#F5F5F5]/20 hover:bg-white transition-all group">
                <div className="w-12 h-12 bg-[#FBDA00] rounded-full flex items-center justify-center font-black text-lg text-black shrink-0 shadow-sm border border-black/5">
                  {product.seller.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[#0A0A0A] truncate">{product.seller.name}</p>
                    {Number(product.seller.ratingAvg) >= 4.0 && (
                      <span className="bg-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mt-1">
                    <span className="truncate">{product.seller.faculty}</span>
                    <span>·</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#FBDA00]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-extrabold text-[#0A0A0A]">{Number(product.seller.ratingAvg).toFixed(1)}</span>
                    </div>
                    <span className="shrink-0">({product.seller.ratingCount} ulasan)</span>
                  </div>
                </div>
                <span className="ml-auto text-[#ABABAB] group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-all">→</span>
              </Link>

              {/* CTA Action Buttons with micro-interactions */}
              {!isOwner && isLoggedIn && (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <ReserveButton productId={product.id} status={product.status} />
                    <WishlistButton productId={product.id} />
                  </div>
                  <ChatButton productId={product.id} sellerId={product.seller.id} />
                </div>
              )}
              {isOwner && (
                <div className="flex gap-3">
                  <Link href={`/sell/${product.id}/edit`}
                    className="flex-1 bg-[#0A0A0A] text-white font-semibold py-3.5 rounded-2xl text-center hover:bg-black transition-all active:scale-[0.99] shadow-sm">
                    Edit Produk
                  </Link>
                </div>
              )}
              {!isLoggedIn && (
                <Link href="/login"
                  className="block w-full bg-[#FBDA00] text-black font-extrabold py-3.5 rounded-2xl text-center hover:bg-[#FACC15] transition-all active:scale-[0.99] shadow-sm">
                  Login untuk Melakukan Reservasi
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
