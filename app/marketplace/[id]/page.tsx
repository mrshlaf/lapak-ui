import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Footer } from "@/components/Footer";
import { verifySession } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";
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

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: { id: true, name: true, faculty: true, profilePicture: true, ratingAvg: true, ratingCount: true, createdAt: true },
      },
      images: { orderBy: { orderIndex: "asc" } },
    },
  });

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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div className="pb-16">
      {/* Premium Navbar - Konsisten dengan Dashboard */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] h-16 flex items-center px-6 shadow-sm">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Link href="/marketplace" className="text-[#6B6B6B] hover:text-[#0A0A0A] transition-all text-sm font-semibold flex items-center gap-1.5 group">
                <svg className="w-3.5 h-3.5 text-[#6B6B6B] group-hover:text-[#0A0A0A] group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg> Kembali
              </Link>
              <div className="h-4 w-px bg-[#E5E5E5]" />
              <img src="/images/logo-ui.png" alt="Logo UI" className="h-8 w-auto object-contain" />
              <span className="font-extrabold text-lg tracking-tight text-[#0A0A0A]">Lapak UI</span>
            </div>

            {/* Easy Access Links - Ditambahkan agar konsisten dengan Dashboard */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center space-x-6 border-l border-[#E5E5E5] pl-6">
                <Link href="/marketplace" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all">
                  Katalog
                </Link>
                <Link href="/sell" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all">
                  Jual
                </Link>
                <Link href="/community" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all">
                  Komunitas
                </Link>
                <Link href="/chat" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 relative">
                  Chat
                  {unreadMessagesCount > 0 && (
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
                  )}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && currentUser ? (
              <>
                <NotificationBell />
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#FBDA00] rounded-full flex items-center justify-center text-sm font-bold text-black border border-black/10 hover:opacity-90 transition-all">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="text-xs font-bold bg-[#FBDA00] text-[#000000] px-4 py-2 rounded-full hover:bg-[#FACC15] transition-colors">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

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
                {product.images.slice(1).map((img, i) => (
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
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#FBDA00]/10 text-black px-3 py-1.5 rounded-xl border border-[#FBDA00]/30 animate-bounce">
                    🤝 Bisa Nego
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
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Lokasi COD</p>
                      <p className="font-semibold text-[#0A0A0A] leading-snug">{product.codLocation}</p>
                    </div>
                  </div>
                )}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-lg">⏱️</span>
                  <div>
                    <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Masa Reservasi</p>
                    <p className="font-semibold text-[#0A0A0A]">{product.reservationDuration} Jam</p>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-lg">🏷️</span>
                  <div>
                    <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-0.5">Kategori</p>
                    <p className="font-semibold text-[#0A0A0A] capitalize leading-snug">{product.subCategory ?? product.category}</p>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-start gap-2.5">
                  <span className="text-lg">👁️</span>
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
