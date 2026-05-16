import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

import { Navbar } from "@/components/Navbar";

const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BoxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const ChatIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ClipboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") redirect("/dashboard");

  const cacheKey = "admin:stats";
  let stats;
  try {
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) stats = JSON.parse(cachedStats);
  } catch (e) {
    console.error("Redis get error:", e);
  }

  if (!stats) {
    stats = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.post.count(),
      prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, faculty: true, role: true, isActive: true, createdAt: true } }),
    ]);
    try {
      await redis.set(cacheKey, JSON.stringify(stats), "EX", 300); // 5 min cache
    } catch (e) {
      console.error("Redis set error:", e);
    }
  }

  const [userCount, productCount, transactionCount, completedCount, postCount, recentUsers] = stats;

  return (
    <div className="pt-28 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">Admin Dashboard</h1>
          <p className="text-[#6B6B6B] font-medium mt-2">Kelola seluruh ekosistem Lapak UI dari satu tempat.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {[
            { label: "Total User", value: userCount, icon: <UsersIcon /> },
            { label: "Produk Aktif", value: productCount, icon: <BoxIcon /> },
            { label: "Transaksi", value: transactionCount, icon: <ClipboardIcon /> },
            { label: "Sukses", value: completedCount, icon: <ClipboardIcon /> },
            { label: "Post Forum", value: postCount, icon: <ChatIcon /> },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#E5E5E5]/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-2xl ${s.label === 'Produk Aktif' ? 'bg-[#FBDA00] text-black' : 'bg-[#F5F5F5] text-[#0A0A0A]'} flex items-center justify-center mb-4 transition-colors`}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-[#0A0A0A]">{s.value}</div>
              <div className="text-[10px] font-bold text-[#ABABAB] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { href: "/admin/users", label: "Manajemen User", icon: <UsersIcon /> },
            { href: "/admin/products", label: "Manajemen Produk", icon: <BoxIcon /> },
            { href: "/admin/posts", label: "Moderasi Post", icon: <ChatIcon /> },
            { href: "/admin/transactions", label: "Pantau Transaksi", icon: <ClipboardIcon /> },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#0A0A0A] transition-colors">
              <span className="text-[#0A0A0A]">{icon}</span>
              <span className="text-sm font-semibold text-[#0A0A0A]">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0A0A0A]">User Terbaru</h2>
            <Link href="/admin/users" className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A]">Lihat semua →</Link>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-left">
                  <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Nama</th>
                  <th className="px-5 py-3.5 font-semibold text-[#6B6B6B] hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-[#6B6B6B] hidden md:table-cell">Fakultas</th>
                  <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#0A0A0A]">
                      {u.name}
                      {u.role === "admin" && <span className="ml-2 text-xs bg-[#FBDA00] text-black px-2 py-0.5 rounded-full">admin</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[#6B6B6B] hidden md:table-cell">{u.email}</td>
                    <td className="px-5 py-3.5 text-[#6B6B6B] hidden md:table-cell">{u.faculty ?? "-"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-red-100 text-red-700"}`}>
                        {u.isActive ? "Aktif" : "Suspended"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
