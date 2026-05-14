"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

const FACULTIES = [
  "Fakultas Kedokteran",
  "Fakultas Matematika dan Ilmu Pengetahuan Alam",
  "Fakultas Hukum",
  "Fakultas Teknik",
  "Fakultas Ekonomi dan Bisnis",
  "Fakultas Ilmu Pengetahuan Budaya",
  "Fakultas Psikologi",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
  "Fakultas Kesehatan Masyarakat",
  "Fakultas Ilmu Keperawatan",
  "Fakultas Farmasi",
  "Fakultas Ilmu Komputer",
  "Fakultas Ilmu Administrasi",
  "Sekolah Kajian Stratejik dan Global",
  "Vokasi",
];

type ProfileClientViewProps = {
  initialUser: {
    id: string;
    name: string;
    email: string;
    faculty: string | null;
    profilePicture: string | null;
    ratingAvg: number;
    ratingCount: number;
    createdAt: string;
    isActive: boolean;
    telegramChatId: string | null;
    _count: { products: number; transactionsAsBuyer: number; posts: number };
  };
  products: any[];
  reviews: any[];
  comments?: any[];
  isOwn: boolean;
};

const inputClass =
  "w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all";

export default function ProfileClientView({
  initialUser,
  products = [],
  reviews = [],
  comments = [],
  isOwn,
}: ProfileClientViewProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    faculty: user.faculty || "",
    telegramChatId: user.telegramChatId || "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setUser((prev) => ({
        ...prev,
        name: data.user.name,
        faculty: data.user.faculty,
        telegramChatId: data.user.telegramChatId,
      }));
      setIsEditing(false);
    } else {
      setError(data.error ?? "Gagal menyimpan profil.");
    }
  };

  const handleChat = async () => {
    if (loadingChat) return;
    setLoadingChat(true);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.chat.id}`);
      } else {
        alert("Gagal memulai percakapan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setLoadingChat(false);
    }
  };

  function formatPrice(p: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(p);
  }

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    return `${diffDays}h lalu`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        {/* Premium Contextual Header Page Navbar */}
        <PageHeader title="Profil" backHref="/marketplace" backLabel="Katalog" maxWidth="max-w-4xl">
          {isOwn && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-[#0A0A0A] bg-[#F5F5F5] hover:bg-[#E5E5E5] px-4 py-2.5 rounded-full transition-all active:scale-95"
            >
              {isEditing ? "Batal" : "Edit Profil"}
            </button>
          )}
        </PageHeader>

        <div className="pt-24 max-w-4xl mx-auto px-6 pb-16">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-[#E5E5E5] p-8 mb-6 space-y-4">
              <h2 className="text-xl font-bold text-[#0A0A0A] mb-4">Edit Profil & Integrasi</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Nama Lengkap</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Fakultas</label>
                <select
                  value={form.faculty}
                  onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Pilih Fakultas</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-[#F5F5F5] space-y-3">
                <h3 className="font-semibold text-[#0A0A0A] mb-1">📬 Integrasi Telegram</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Dapatkan notifikasi langsung di Telegram untuk reservasi baru, penerimaan reservasi, & status COD.
                  Hubungkan dengan memasukkan Chat ID secara manual, atau **klik tombol di bawah ini** untuk menghubungkan
                  akun Telegram secara instan dan otomatis!
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={form.telegramChatId}
                    onChange={(e) => setForm((p) => ({ ...p, telegramChatId: e.target.value }))}
                    placeholder="Masukkan Telegram Chat ID"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/telegram-connect");
                        if (res.ok) {
                          const data = await res.json();
                          window.open(data.connectUrl, "_blank");
                        } else {
                          alert("Gagal memicu integrasi Telegram.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Terjadi kesalahan.");
                      }
                    }}
                    className="bg-[#0A0A0A] text-white hover:bg-[#1a1a1a] font-semibold px-6 py-3 rounded-2xl text-sm shrink-0 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    ⚡ Hubungkan Otomatis
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#FBDA00] text-black font-semibold py-3 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 bg-[#F5F5F5] text-[#0A0A0A] font-semibold py-3 rounded-2xl hover:bg-[#E5E5E5] transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            /* Profile Header Card */
            <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-[#FBDA00] rounded-2xl flex items-center justify-center text-3xl font-bold text-black shrink-0 border border-[#E5E5E5]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight truncate">{user.name}</h1>
                    {user.faculty && <p className="text-sm text-[#6B6B6B] mt-1 font-semibold">{user.faculty}</p>}
                    
                    <div className="flex items-center gap-4 mt-3">
                      {/* Star Rating Badge - No Emoticons */}
                      <div className="flex items-center gap-1.5 bg-[#FFFBEA] border border-[#FDE047] px-3 py-1 rounded-full text-xs font-black text-[#854D0E]">
                        <svg className="w-3.5 h-3.5 text-[#FACC15]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{Number(user.ratingAvg).toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-[#A16207]">({user.ratingCount} ulasan)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Message Chat button - High-end premium */}
                {!isOwn && (
                  <button
                    onClick={handleChat}
                    disabled={loadingChat}
                    className="bg-[#0A0A0A] text-white hover:bg-[#1a1a1a] font-extrabold px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-md"
                  >
                    {loadingChat ? (
                      <span>Menghubungkan...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                          />
                        </svg>
                        <span>Kirim Pesan</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#F5F5F5]">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-[#0A0A0A]">{user._count.products}</p>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mt-0.5">Produk</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-[#0A0A0A]">{user.ratingCount}</p>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mt-0.5">Ulasan</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-[#0A0A0A]">
                    {Math.max(
                      0,
                      Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
                    )}{" "}
                    bln
                  </p>
                  <p className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider mt-0.5">Bergabung</p>
                </div>
              </div>
            </div>
          )}

          {/* Unified Stacked Layout (Combined Sections Goin' Downwards) */}
          {!isEditing && (
            <div className="space-y-12">
              {/* 1. SECTION: Produk Aktif */}
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-[#E5E5E5] pb-3.5">
                  <h2 className="text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider">
                    Produk Aktif ({products.length})
                  </h2>
                  {products.length > 0 && (
                    <Link
                      href={`/marketplace?seller=${user.id}`}
                      className="text-xs font-bold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
                    >
                      Lihat semua
                    </Link>
                  )}
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
                    {/* Shopping Bag SVG - No Emoticon */}
                    <svg className="w-8 h-8 mx-auto mb-3 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <h4 className="text-xs font-bold text-[#0A0A0A] mb-1">Belum Ada Produk Aktif</h4>
                    <p className="text-[10px] text-[#6B6B6B]">Pengguna ini sedang tidak menjual produk apa pun.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/marketplace/${p.id}`}
                        className="group bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:border-[#0A0A0A] hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-[4/3] bg-[#F5F5F5] overflow-hidden">
                          {p.images[0] ? (
                            <img
                              src={p.images[0].imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#ABABAB]">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-bold text-[#0A0A0A] line-clamp-2 leading-snug group-hover:text-black">
                            {p.title}
                          </p>
                          <p className="text-sm font-black mt-2 text-[#0A0A0A]">{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. SECTION: Komentar Forum */}
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-[#E5E5E5] pb-3.5">
                  <h2 className="text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider">
                    Komentar Forum ({comments.length})
                  </h2>
                </div>

                {comments.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
                    {/* Speech Bubble SVG - No Emoticon */}
                    <svg className="w-8 h-8 mx-auto mb-3 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <h4 className="text-xs font-bold text-[#0A0A0A] mb-1">Belum Ada Komentar</h4>
                    <p className="text-[10px] text-[#6B6B6B]">Pengguna ini belum pernah mengomentari postingan apa pun.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c: any) => (
                      <div
                        key={c.id}
                        className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:border-[#0A0A0A] transition-all duration-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-[#ABABAB]">
                          {/* Chat SVG instead of emoji */}
                          <svg className="w-3.5 h-3.5 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                          </svg>
                          <span className="text-[#6B6B6B]">Mengomentari Postingan</span>
                          <span>·</span>
                          <span className="uppercase tracking-wider">{timeAgo(c.createdAt)}</span>
                        </div>

                        {/* Post context card */}
                        <div className="bg-[#F5F5F5] rounded-xl p-3 mb-3 border-l-2 border-[#FBDA00]">
                          <p className="text-xs text-[#6B6B6B] line-clamp-2 italic leading-relaxed">
                            "{c.postContent}"
                          </p>
                        </div>

                        {/* Actual comment content */}
                        <p className="text-sm font-semibold text-[#0A0A0A] leading-relaxed pl-1">
                          {c.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. SECTION: Ulasan Pengguna */}
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-[#E5E5E5] pb-3.5">
                  <h2 className="text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider">
                    Ulasan Pengguna ({reviews.length})
                  </h2>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm">
                    {/* Rating star SVG - No Emoticon */}
                    <svg className="w-8 h-8 mx-auto mb-3 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.107-.29-.444-.29-.55 0l-1.87 5.745H3.07c-.312 0-.442.4-.187.584l4.706 3.425-1.797 5.518c-.098.3.242.547.499.36L11 15.606l4.71 3.425c.257.187.597-.06.499-.36l-1.797-5.518 4.707-3.425c.255-.184.125-.584-.188-.584h-5.99l-1.87-5.745z" />
                    </svg>
                    <h4 className="text-xs font-bold text-[#0A0A0A] mb-1">Belum Ada Ulasan</h4>
                    <p className="text-[10px] text-[#6B6B6B]">Pengguna ini belum menerima ulasan apa pun.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:border-[#0A0A0A] transition-all duration-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#0A0A0A]">{r.reviewer.name}</span>
                            <span className="text-xs text-[#ABABAB]">· {r.reviewer.faculty}</span>
                          </div>
                          
                          {/* Modern SVG stars - No Emoticons */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${i < r.rating ? "text-[#FACC15]" : "text-[#E5E5E5]"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-sm font-semibold text-[#6B6B6B] leading-relaxed pl-1">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
