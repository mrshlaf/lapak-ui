"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    faculty: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registrasi gagal.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              Lapak UI
            </span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-[#0A0A0A] tracking-tight">
            Buat Akun
          </h1>
          <p className="mt-2 text-[#6B6B6B] text-sm">
            Bergabung dengan komunitas marketplace mahasiswa UI
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#0A0A0A] mb-2"
              >
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap kamu"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#0A0A0A] mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="email@kamu.com"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#0A0A0A] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 pr-12 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#0A0A0A] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Fakultas */}
            <div>
              <label
                htmlFor="faculty"
                className="block text-sm font-medium text-[#0A0A0A] mb-2"
              >
                Fakultas{" "}
                <span className="text-[#ABABAB] font-normal">(opsional)</span>
              </label>
              <select
                id="faculty"
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">Pilih Fakultas</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FBDA00] text-[#000000] font-semibold py-3.5 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B6B6B] mt-6">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[#0A0A0A] font-semibold hover:text-[#6B6B6B] transition-colors"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
