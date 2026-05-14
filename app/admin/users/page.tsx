"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type User = {
  id: string; name: string; email: string; faculty: string | null; role: string;
  isActive: boolean; ratingAvg: number; createdAt: string;
  _count: { products: number; transactionsAsBuyer: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSuspend = async (id: string) => {
    await fetch(`/api/admin/users/${id}/suspend`, { method: "PUT" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-[#6B6B6B] hover:text-[#0A0A0A] text-sm">← Admin</Link>
          <span className="font-bold text-lg text-[#0A0A0A]">Manajemen User</span>
        </div>
      </nav>

      <div className="pt-16 max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">User ({total})</h1>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama/email..."
            className="bg-white border border-[#E5E5E5] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#0A0A0A] w-64" />
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left bg-[#F5F5F5]">
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Nama</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B] hidden md:table-cell">Email</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B] hidden lg:table-cell">Fakultas</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Produk</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Status</th>
                <th className="px-5 py-3.5 font-semibold text-[#6B6B6B]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-4 bg-[#F5F5F5] rounded animate-pulse" /></td></tr>
                ))
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#0A0A0A]">
                    {u.name}
                    {u.role === "admin" && <span className="ml-2 text-xs bg-[#FBDA00] text-black px-2 py-0.5 rounded-full">admin</span>}
                  </td>
                  <td className="px-5 py-3.5 text-[#6B6B6B] hidden md:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B] hidden lg:table-cell">{u.faculty ?? "-"}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{u._count.products}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Aktif" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.role !== "admin" && (
                      <button onClick={() => toggleSuspend(u.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${u.isActive ? "border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white" : "border border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white"}`}>
                        {u.isActive ? "Suspend" : "Aktifkan"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-6">
          {page > 1 && <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-[#E5E5E5] rounded-full text-sm hover:border-[#0A0A0A]">← Sebelumnya</button>}
          {users.length === 20 && <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-[#0A0A0A] text-white rounded-full text-sm">Selanjutnya →</button>}
        </div>
      </div>
    </div>
  );
}
