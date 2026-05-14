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
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
              />
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
