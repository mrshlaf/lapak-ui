"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login gagal.");
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
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              Lapak UI
            </span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-[#0A0A0A] tracking-tight">
            Selamat Datang
          </h1>
          <p className="mt-2 text-[#6B6B6B] text-sm">
            Masuk ke akun Lapak UI kamu
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
                placeholder="Password kamu"
                className="w-full bg-[#F5F5F5] border border-transparent rounded-2xl px-4 py-3 text-[#0A0A0A] placeholder-[#ABABAB] focus:outline-none focus:border-[#0A0A0A] focus:bg-white transition-all"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FBDA00] text-[#000000] font-semibold py-3.5 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6B6B6B] mt-6">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-[#0A0A0A] font-semibold hover:text-[#6B6B6B] transition-colors"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
