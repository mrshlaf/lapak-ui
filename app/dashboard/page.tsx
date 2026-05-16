import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import Link from "next/link";
import { Footer } from "@/components/Footer";

// Icons
const ShoppingBagIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const BoxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InboxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-2.586 2.586a1 1 0 01-.707.293H9.293a1 1 0 01-.707-.293L6 13" /></svg>;
const ClipboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const HeartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const EnvelopeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;

  const cacheKey = `dashboard:user:${session.userId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error("Redis error:", e);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, email: true, faculty: true, role: true,
      profilePicture: true, ratingAvg: true, ratingCount: true,
      _count: { select: { products: true, reservationsAsBuyer: true, posts: true } },
    },
  });

  if (user) {
    try { await redis.set(cacheKey, JSON.stringify(user), "EX", 15); } catch (e) { console.error(e); }
  }
  return user;
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const countsCacheKey = `dashboard:counts:${user.id}`;
  let counts;
  try {
    const cachedCounts = await redis.get(countsCacheKey);
    if (cachedCounts) counts = JSON.parse(cachedCounts);
  } catch (e) { console.error(e); }

  if (!counts) {
    counts = await Promise.all([
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.message.count({
        where: {
          chat: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
          senderId: { not: user.id },
          isRead: false,
        },
      }),
    ]);
    try { await redis.set(countsCacheKey, JSON.stringify(counts), "EX", 15); } catch (e) { console.error(e); }
  }

  const [unreadNotificationsCount, unreadMessagesCount] = counts;

  const bentoCards = [
    { href: "/marketplace", label: "Katalog Marketplace", sub: "Barang bekas & jasa mahasiswa UI.", icon: <ShoppingBagIcon />, wide: true, yellow: false },
    { href: "/sell", label: "Jual Produk", sub: "Tawarkan barang atau jasamu.", icon: <PlusIcon />, wide: false, yellow: true },
    { href: "/my-products", label: "Produk Saya", sub: "Kelola daganganmu.", icon: <BoxIcon />, wide: false, yellow: false, badge: `${user._count.products} item`, badgeColor: "text-emerald-600 bg-emerald-50 border border-emerald-200" },
    { href: "/reservations/incoming", label: "Reservasi Masuk", sub: "Pantau pesanan dari pembeli.", icon: <InboxIcon />, wide: false, yellow: false },
    { href: "/reservations/outgoing", label: "Reservasi Saya", sub: "Sisa batas waktu COD.", icon: <ClockIcon />, wide: false, yellow: false, badge: `${user._count.reservationsAsBuyer} booking`, badgeColor: "text-amber-600 bg-amber-50 border border-amber-200" },
    { href: "/transactions", label: "Histori Transaksi", sub: "Catatan jual beli selesai.", icon: <ClipboardIcon />, wide: false, yellow: false },
    { href: "/chat", label: "Chat Masuk", sub: "Obrolan penawaran harga.", icon: <EnvelopeIcon />, wide: false, yellow: false, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} pesan baru` : undefined, badgeColor: "text-white bg-red-500", hasAlert: unreadMessagesCount > 0 },
    { href: "/notifications", label: "Notifikasi", sub: "Aktivitas & sistem.", icon: <BellIcon />, wide: false, yellow: false, badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} notif baru` : undefined, badgeColor: "text-white bg-red-500", hasAlert: unreadNotificationsCount > 0 },
    { href: "/community", label: "Komunitas Kampus", sub: "Diskusi kosan, event, dan tips mahasiswa UI.", icon: <SparklesIcon />, wide: true, yellow: false },
    { href: "/wishlist", label: "Wishlist", sub: "Daftar barang incaran.", icon: <HeartIcon />, wide: false, yellow: false },
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-[#FBDA00] selection:text-black">

      {/* Cinematic Hero — full dark, no fade at bottom */}
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden bg-[#0A0A0A]">
        <img src="/images/ui-images.jpeg" alt="UI Campus" className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
        {/* Dark tint — heavier for premium look */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Left-to-right vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
        {/* Bottom dark fade — blends to dark, not white */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20">
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-3">
            Halo,<br />
            <span className="text-[#FBDA00]">{user.name.split(" ")[0]}.</span>
          </h1>
          <p className="text-white/55 text-xs md:text-base font-medium">
            {user.faculty ?? "Universitas Indonesia"} &mdash; selamat datang kembali.
          </p>
        </div>
      </div>

      {/* Overlap Stats — negative margin pulls cards over the photo */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Produk Aktif", value: user._count.products, yellow: true },
            { label: "Reservasi", value: user._count.reservationsAsBuyer, yellow: false },
            { label: "Postingan", value: user._count.posts, yellow: false },
            { label: `${Number(user.ratingAvg).toFixed(1)}/5 ★`, value: `${user.ratingCount} ulasan`, yellow: false },
          ].map(({ label, value, yellow }) => (
            <div key={label} className={`rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)] border ${
              yellow
                ? "bg-[#FBDA00] border-[#FBDA00] text-black"
                : "bg-white border-white/80 text-[#0A0A0A]"
            }`}>
              <div className="text-3xl font-black">{value}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${yellow ? "text-black/60" : "text-[#ABABAB]"}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bento Nav Grid */}
        <p className="text-[10px] font-black text-[#ABABAB] uppercase tracking-[0.25em] mb-5">Pusat Navigasi</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {bentoCards.map(({ href, label, sub, icon, wide, yellow, badge, badgeColor, hasAlert }: any) => (
            <Link
              key={href}
              href={href}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-md ${wide ? "lg:col-span-2 md:col-span-2 min-h-[200px] p-8" : "min-h-[170px]"} ${yellow ? "bg-[#FBDA00] border border-[#FBDA00] hover:bg-[#FFE44D] hover:shadow-[0_20px_40px_rgba(251,218,0,0.25)]" : hasAlert ? "bg-white border-2 border-red-400 hover:border-red-500 hover:shadow-[0_4px_20px_rgba(239,68,68,0.15)]" : "bg-white border border-[#E5E5E5] hover:border-[#0A0A0A]/20"}`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${yellow ? "bg-black/10 text-black group-hover:bg-black group-hover:text-[#FBDA00]" : hasAlert ? "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white" : "bg-[#F5F5F5] text-[#6B6B6B] group-hover:bg-[#FBDA00] group-hover:text-black"}`}>
                  {icon}
                </div>
                {badge && (
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${badgeColor} ${hasAlert ? "animate-pulse" : ""}`}>
                    {badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className={`font-black tracking-tight ${wide ? "text-xl" : "text-base"} ${yellow ? "text-black" : "text-[#0A0A0A]"}`}>{label}</h3>
                <p className={`text-xs font-medium mt-0.5 ${yellow ? "text-black/50" : "text-[#6B6B6B]"}`}>{sub}</p>
              </div>
            </Link>
          ))}

          {/* Admin card — conditional */}
          {user.role === "admin" && (
            <Link href="/admin" className="rounded-3xl p-6 bg-white border border-[#FBDA00]/40 hover:border-[#FBDA00] hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[170px] group hover:-translate-y-0.5">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#FBDA00]/10 text-[#0A0A0A] group-hover:bg-[#FBDA00] group-hover:text-black rounded-2xl transition-all duration-300">
                  <SparklesIcon />
                </div>
                <span className="text-[9px] font-black text-black bg-[#FBDA00] px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>
              </div>
              <div>
                <h3 className="text-base font-black text-[#0A0A0A] tracking-tight">Admin Panel</h3>
                <p className="text-xs font-semibold text-[#6B6B6B] mt-0.5">Kelola seluruh platform.</p>
              </div>
            </Link>
          )}
        </div>

        {/* Bottom actions */}
        <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center gap-3 bg-[#0A0A0A] text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-[#1A1A1A] active:scale-[0.98] transition-all shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profil
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 border-2 border-[#E5E5E5] bg-white text-[#EF4444] font-bold px-6 py-3.5 rounded-2xl hover:border-red-300 hover:bg-red-50 active:scale-[0.98] transition-all text-sm cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar dari Akun
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
