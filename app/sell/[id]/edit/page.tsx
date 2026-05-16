"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

const FACULTIES = [
  "Fakultas Farmasi",
  "Fakultas Hukum",
  "Fakultas Ilmu Administrasi",
  "Fakultas Ilmu Pengetahuan Budaya",
  "Fakultas Ekonomi Dan Bisnis",
  "Fakultas Ilmu Keperawatan",
  "Fakultas Ilmu Komputer",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
  "Fakultas Kedokteran",
  "Fakultas Kedokteran Gigi",
  "Fakultas Kesehatan Masyarakat",
  "Fakultas Matematika Dan Ilmu Pengetahuan Alam",
  "Fakultas Psikologi",
  "Fakultas Teknik",
  "Program Pendidikan Vokasi",
  "Sekolah Ilmu Lingkungan",
  "Sekolah Kajian Stratejik Dan Global",
];
const POPULAR_LOCATIONS = ["Kantin FT", "Perpustakaan Pusat UI", "Stasiun UI", "Pusgiwa UI", "Kantin FISIP", "Kutek", "Barel", "Asrama UI"];
const BARANG_SUBS = ["Elektronik","Buku","Alat Tulis","Pakaian","Furnitur","Lainnya"];
const JASA_SUBS = ["Desain","Les/Tutor","Fotografi","Coding","Lainnya"];
const CONDITIONS = [{ value: "baru", label: "Baru" }, { value: "bekas_mulus", label: "Bekas - Mulus" }, { value: "bekas_normal", label: "Bekas - Normal" }];
const DURATIONS = [{ value: 2, label: "2 jam" }, { value: 6, label: "6 jam" }, { value: 12, label: "12 jam" }, { value: 24, label: "24 jam" }];

const inputClass = "w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", isNegotiable: false,
    category: "barang", subCategory: "", condition: "bekas_mulus",
    reservationDuration: 24, codLocation: "", facultyLocation: "",
  });

  const fetchProduct = useCallback(async () => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
      setError("Gagal memuat produk.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.product) {
      setForm({
        title: data.product.title || "",
        description: data.product.description || "",
        price: String(data.product.price || ""),
        isNegotiable: data.product.isNegotiable || false,
        category: data.product.category || "barang",
        subCategory: data.product.subCategory || "",
        condition: data.product.condition || "bekas_mulus",
        reservationDuration: data.product.reservationDuration || 24,
        codLocation: data.product.codLocation || "",
        facultyLocation: data.product.facultyLocation || "",
      });
      if (data.product.images) {
        setImages(data.product.images.map((img: { imageUrl: string }) => img.imageUrl));
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const subCategories = form.category === "barang" ? BARANG_SUBS : JASA_SUBS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages(prev => [...prev, reader.result as string].slice(0, 5)); // max 5 foto
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Foto produk wajib diisi (minimal 1 foto).");
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseInt(form.price), images }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) router.push(`/marketplace/${id}`);
    else setError(data.error ?? "Gagal memperbarui produk.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#ABABAB]">Memuat produk...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageHeader title="Edit Produk" backHref="/my-products" backLabel="Produk Saya" maxWidth="max-w-3xl" />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">Edit Produk</h1>
          <p className="text-[#6B6B6B] mt-1">Perbarui detail produk atau jasa yang kamu tawarkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>}

          {/* Kategori */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-4">Kategori</h2>
            <div className="flex gap-3 mb-4">
              {["barang", "jasa"].map((c) => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, category: c, subCategory: "" }))}
                  className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${form.category === c ? "bg-[#0A0A0A] text-white" : "bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]"}`}>
                  {c === "barang" ? "Barang Bekas" : "Jasa"}
                </button>
              ))}
            </div>
            <select name="subCategory" value={form.subCategory} onChange={handleChange} className={inputClass}>
              <option value="">Pilih Sub-Kategori</option>
              {subCategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Detail Produk */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="font-semibold text-[#0A0A0A]">Detail Produk</h2>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#0A0A0A]">Judul Produk *</label>
                <span className="text-[10px] font-bold text-[#ABABAB]">{form.title.length} / 80</span>
              </div>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Contoh: Laptop Asus VivoBook 2022" maxLength={80} className={inputClass} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#0A0A0A]">Deskripsi</label>
                <span className="text-[10px] font-bold text-[#ABABAB]">{form.description.length} / 1000</span>
              </div>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Jelaskan kondisi, spesifikasi, atau detail lainnya..." maxLength={1000} className={inputClass} />
            </div>
            {form.category === "barang" && (
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Kondisi</label>
                <select name="condition" value={form.condition} onChange={handleChange} className={inputClass}>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Foto Produk */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-[#0A0A0A]">Foto Produk *</h2>
              <div className="flex items-center gap-3">
                {images.length > 0 && (
                  <button type="button" onClick={() => setImages([])} className="text-[10px] font-extrabold text-[#EF4444] hover:text-red-700 uppercase tracking-wider transition-colors">
                    Hapus Semua
                  </button>
                )}
                <span className="text-xs text-[#6B6B6B] font-semibold">{images.length} / 5 Foto</span>
              </div>
            </div>
            <p className="text-xs text-[#ABABAB] leading-relaxed">Pilih minimal 1 foto produk terbaikmu. Format gambar yang didukung adalah .jpg, .jpeg, dan .png.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] group">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black p-1.5 rounded-full transition-colors flex items-center justify-center shadow"
                    title="Hapus foto"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">UTAMA</span>
                  )}
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-[#E5E5E5] hover:border-[#0A0A0A] transition-all flex flex-col items-center justify-center cursor-pointer text-[#6B6B6B] hover:text-black bg-[#FAF9F6]/20">
                  <svg className="w-6 h-6 mb-1 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">Upload</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>

          {/* Harga */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="font-semibold text-[#0A0A0A]">Harga</h2>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Harga (Rp) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="0" min="0" className={inputClass} />
              {form.price && !isNaN(Number(form.price)) && (
                <p className="text-xs font-bold text-emerald-600 mt-1.5 bg-emerald-50 px-3 py-1 rounded-xl inline-block">
                  Terbaca: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(form.price))}
                </p>
              )}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isNegotiable" checked={form.isNegotiable}
                onChange={(e) => setForm(p => ({ ...p, isNegotiable: e.target.checked }))}
                className="w-5 h-5 accent-[#FBDA00]" />
              <span className="text-sm text-[#0A0A0A]">Harga bisa dinegosiasi</span>
            </label>
            {form.isNegotiable && (
              <div className="bg-[#FFFBEA] border border-[#FBDA00]/30 rounded-2xl p-3.5 text-xs text-[#854D0E] font-medium flex items-center gap-2">
                <span className="text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                <span>Buyer akan melihat badge "Bisa Nego" dan dapat menawar harga lewat fitur chat.</span>
              </div>
            )}
          </div>

          {/* COD & Reservasi */}
          <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 space-y-4">
            <h2 className="font-semibold text-[#0A0A0A]">COD & Reservasi</h2>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Lokasi COD</label>
              <input name="codLocation" value={form.codLocation} onChange={handleChange} placeholder="Contoh: Kantin FT, Stasiun UI" className={inputClass} />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {POPULAR_LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, codLocation: loc }))}
                    className="text-[10px] font-bold text-[#6B6B6B] hover:text-[#0A0A0A] bg-[#F5F5F5] hover:bg-[#E5E5E5] px-2.5 py-1 rounded-full transition-all"
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Lokasi Fakultas</label>
              <select name="facultyLocation" value={form.facultyLocation} onChange={handleChange} className={inputClass}>
                <option value="">Pilih Fakultas</option>
                {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Durasi Reservasi</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(d => (
                  <button key={d.value} type="button" onClick={() => setForm(p => ({ ...p, reservationDuration: d.value }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${form.reservationDuration === d.value ? "bg-[#FBDA00] text-black" : "bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} id="sell-submit"
            className="w-full bg-[#FBDA00] text-black font-semibold py-4 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-60 text-base">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
