import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  if (!session || session.role !== "admin") redirect("/dashboard");

  const [userCount, productCount, transactionCount, completedCount, postCount, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "completed" } }),
    prisma.post.count(),
    prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, faculty: true, role: true, isActive: true, createdAt: true } }),
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <span className="font-bold text-lg text-[#0A0A0A]">Lapak UI — Admin</span>
          <Link href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A]">Kembali ke Dashboard</Link>
        </div>
      </nav>

      <div className="pt-16 max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total User", value: userCount, color: "bg-[#FBDA00]" },
            { label: "Total Produk", value: productCount, color: "bg-white" },
            { label: "Total Transaksi", value: transactionCount, color: "bg-white" },
            { label: "Transaksi Selesai", value: completedCount, color: "bg-white" },
            { label: "Total Post", value: postCount, color: "bg-white" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} border border-[#E5E5E5] rounded-2xl p-5`}>
              <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
              <p className="text-sm text-[#6B6B6B] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { href: "/admin/users", label: "Manajemen User", icon: "👥" },
            { href: "/admin/products", label: "Manajemen Produk", icon: "📦" },
            { href: "/admin/posts", label: "Moderasi Post", icon: "💬" },
            { href: "/admin/transactions", label: "Pantau Transaksi", icon: "📋" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex flex-col gap-2 hover:border-[#0A0A0A] transition-colors">
              <span className="text-2xl">{icon}</span>
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
                {recentUsers.map((u) => (
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
    </div>
  );
}
