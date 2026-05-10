import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { NotificationBell } from "@/components/NotificationBell";

// Monochrome Premium Icons
const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-2.586 2.586a1 1 0 01-.707.293H9.293a1 1 0 01-.707-.293L6 13" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      role: true,
      profilePicture: true,
      ratingAvg: true,
      ratingCount: true,
      _count: {
        select: {
          products: true,
          reservationsAsBuyer: true,
          posts: true,
        },
      },
    },
  });
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadNotificationsCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  // Hitung jumlah pesan chat masuk yang belum dibaca
  const unreadMessagesCount = await prisma.message.count({
    where: {
      chat: {
        OR: [
          { participantAId: user.id },
          { participantBId: user.id },
        ],
      },
      senderId: { not: user.id },
      isRead: false,
    },
  });

  const navItems = [
    { href: "/marketplace", label: "Katalog", icon: <ShoppingBagIcon /> },
    { href: "/sell", label: "Jual Produk", icon: <PlusIcon /> },
    { href: "/my-products", label: "Produk Saya", icon: <BoxIcon /> },
    { href: "/reservations/outgoing", label: "Reservasi Saya", icon: <ClockIcon /> },
    { href: "/reservations/incoming", label: "Reservasi Masuk", icon: <InboxIcon /> },
    { href: "/transactions", label: "Histori Transaksi", icon: <ClipboardIcon /> },
    { href: "/community", label: "Komunitas", icon: <SparklesIcon /> },
    { href: "/wishlist", label: "Wishlist", icon: <HeartIcon /> },
    { href: "/chat", label: "Chat", icon: <EnvelopeIcon /> },
    { href: "/notifications", label: "Notifikasi", icon: <BellIcon /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        {/* Top Navbar with Logo UI & Easy Access Links */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6 shadow-sm">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/images/logo-ui.png" alt="Logo UI" className="h-9 w-auto object-contain hover:scale-105 transition-transform" />
                <div className="h-5 w-px bg-[#E5E5E5]" />
                <span className="font-extrabold text-xl tracking-tight text-[#0A0A0A]">Lapak UI</span>
              </Link>
              
              {/* Easy Access Links - Clean Minimalist Text */}
              <div className="hidden md:flex items-center space-x-6 border-l border-[#E5E5E5] pl-6">
                <Link href="/marketplace" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all flex items-center gap-1">
                  Katalog
                </Link>
                <Link href="/sell" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all flex items-center gap-1">
                  Jual
                </Link>
                <Link href="/community" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all flex items-center gap-1">
                  Komunitas
                </Link>
                <Link href="/chat" className="text-sm font-bold text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 relative">
                  Chat
                  {unreadMessagesCount > 0 && (
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
                  )}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link href="/profile" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FBDA00] rounded-full flex items-center justify-center text-sm font-bold text-black border border-black/10 hover:opacity-90 transition-opacity">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-24 max-w-7xl mx-auto px-6">
          
          {/* Majestic Hero Welcome Card using ui-images.jpeg */}
          <div className="relative rounded-3xl overflow-hidden mb-8 border border-[#E5E5E5] shadow-md bg-black">
            <img src="/images/ui-images.jpeg" alt="UI Campus" className="absolute inset-0 w-full h-full object-cover opacity-35 object-center hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
            
            <div className="relative z-10 px-8 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                  <span className="text-[9px] text-white/90 font-extrabold uppercase tracking-wider">Dasbor Mahasiswa</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Halo, <span className="text-[#FBDA00] relative inline-block">{user.name.split(" ")[0]}!<span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#FBDA00] rounded-full opacity-60"></span></span>
                </h1>
                <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed">
                  {user.faculty ?? "Fakultas UI"} · Selamat datang kembali di portal ekosistem Lapak UI Anda.
                </p>
              </div>
              
              {/* Account Rating Badge */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 text-white shrink-0 shadow-lg">
                <div className="w-12 h-12 bg-[#FBDA00] rounded-full flex items-center justify-center font-bold text-black text-lg border border-white/10 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[9px] text-white/60 font-extrabold uppercase tracking-wider">Peringkat Akun</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#FBDA00]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-extrabold text-white text-base">{Number(user.ratingAvg).toFixed(1)}</span>
                    <span className="text-[10px] text-white/60 font-bold">({user.ratingCount} ulasan)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Produk Jualan", value: user._count.products, accent: true },
              { label: "Reservasi Aktif", value: user._count.reservationsAsBuyer, accent: false },
              { label: "Postingan Forum", value: user._count.posts, accent: false },
              { label: "Rating Account", value: `${Number(user.ratingAvg).toFixed(1)} / 5`, accent: false },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className={`rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm ${accent ? "bg-gradient-to-br from-[#FBDA00] to-[#FACC15] text-black border border-[#FBDA00]" : "bg-white border border-[#E5E5E5] hover:border-[#0A0A0A]"}`}
              >
                <div className={`text-2xl font-bold ${accent ? "text-black" : "text-[#0A0A0A]"}`}>
                  {value}
                </div>
                <div className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${accent ? "text-black/80" : "text-[#6B6B6B]"}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* PREMIUM BENTO GRID - Menggantikan visual kaku "flat boxes" */}
          <div className="mb-4">
            <h2 className="text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-5">Pusat Navigasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Browse Katalog (Large Bento, Spans 2 Columns) */}
              <Link href="/marketplace" className="lg:col-span-2 md:col-span-2 flex flex-col justify-between p-6 bg-white border border-[#E5E5E5] rounded-3xl hover:border-[#0A0A0A] hover:shadow-md transition-all duration-300 min-h-[165px] group bg-gradient-to-br from-white to-[#F9F9F9]">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#0A0A0A] text-white rounded-2xl group-hover:bg-[#FBDA00] group-hover:text-black transition-colors duration-300">
                    <ShoppingBagIcon />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] group-hover:text-[#0A0A0A] transition-colors">Telusuri</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0A0A0A] tracking-tight flex items-center gap-1.5">
                    Katalog Marketplace
                    <svg className="w-3.5 h-3.5 text-[#ABABAB] group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-1">Belanja barang bekas dan jasa mahasiswa UI.</p>
                </div>
              </Link>

              {/* Card 2: Jual Sekarang (Yellow Bento) */}
              <Link href="/sell" className="lg:col-span-1 md:col-span-1 bg-gradient-to-br from-[#FBDA00] to-[#FACC15] text-black rounded-3xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group border border-[#FBDA00]">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-black/10 rounded-2xl group-hover:bg-black group-hover:text-[#FBDA00] transition-all duration-300">
                    <PlusIcon />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-black/60">Pasang Iklan</span>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Jual Produk</h3>
                  <p className="text-xs font-bold text-black/70 mt-0.5">Tawarkan barang/jasa baru.</p>
                </div>
              </Link>

              {/* Card 3: Produk Saya */}
              <Link href="/my-products" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <BoxIcon />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{user._count.products} Produk</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Produk Saya</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Kelola dagangan Anda.</p>
                </div>
              </Link>

              {/* Card 4: Reservasi Masuk */}
              <Link href="/reservations/incoming" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <InboxIcon />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ABABAB]">Inbound</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Reservasi Masuk</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Pantau pesanan masuk.</p>
                </div>
              </Link>

              {/* Card 5: Reservasi Saya */}
              <Link href="/reservations/outgoing" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <ClockIcon />
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{user._count.reservationsAsBuyer} Booking</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Reservasi Saya</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Sisa batas waktu COD.</p>
                </div>
              </Link>

              {/* Card 6: Histori Transaksi */}
              <Link href="/transactions" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/15 group-hover:text-black rounded-2xl transition-all duration-300">
                    <ClipboardIcon />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ABABAB]">Riwayat</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Histori Transaksi</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Catatan jual beli usai.</p>
                </div>
              </Link>

              {/* Card 8: Wishlist Saya */}
              <Link href="/wishlist" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <HeartIcon />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ABABAB]">Simpanan</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Wishlist Saya</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Daftar barang incaran.</p>
                </div>
              </Link>

              {/* Card 7: Komunitas (Large Bento, Spans 2 Columns) */}
              <Link href="/community" className="lg:col-span-2 md:col-span-2 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:shadow-md transition-all duration-300 min-h-[165px] group flex flex-col justify-between bg-gradient-to-br from-white to-[#F9F9F9]">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#0A0A0A] text-white group-hover:bg-[#FBDA00] group-hover:text-black rounded-2xl transition-colors duration-300">
                    <SparklesIcon />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ABABAB] group-hover:text-[#0A0A0A] transition-colors">Forum Kampus</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0A0A0A] tracking-tight flex items-center gap-1.5">
                    Komunitas Kampus
                    <svg className="w-3.5 h-3.5 text-[#ABABAB] group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-1">Diskusikan kosan, event, dan tips mahasiswa UI.</p>
                </div>
              </Link>

              {/* Card 9: Chat Masuk */}
              <Link href="/chat" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group relative">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <EnvelopeIcon />
                  </div>
                  {unreadMessagesCount > 0 && (
                    <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
                      {unreadMessagesCount} BARU
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Chat Masuk</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Obrolan penawaran harga.</p>
                </div>
              </Link>

              {/* Card 10: Notifikasi */}
              <Link href="/notifications" className="lg:col-span-1 md:col-span-1 bg-white border border-[#E5E5E5] rounded-3xl p-6 hover:border-[#0A0A0A] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[165px] group relative">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00]/10 group-hover:text-black rounded-2xl transition-all duration-300">
                    <BellIcon />
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-[#EF4444] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
                      {unreadNotificationsCount} NOTIF
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Notifikasi</h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Aktivitas menyukai & sistem.</p>
                </div>
              </Link>

            </div>
          </div>

          {/* Benchmark Red Sign Out Button - Standar Website Besar */}
          <div className="mt-2 pb-4 border-t border-[#E5E5E5]/60 pt-4">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="border border-[#E5E5E5] bg-white text-sm font-extrabold text-[#EF4444] hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-6 py-3 rounded-2xl transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar dari Akun
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
