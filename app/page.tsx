import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 pt-32 pb-16 px-6">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center py-20">


          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight text-[#0A0A0A]">
            Jual, Beli, dan Terhubung{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Sesama Mahasiswa UI.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-4 bg-[#FBDA00] -z-10 -skew-x-2 opacity-60"></span>
            </span>
          </h1>

          <p className="text-[#6B6B6B] text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            Marketplace barang bekas, jasa, dan komunitas kampus — semuanya dalam satu platform yang bersih dan terpercaya.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/sell"
              className="bg-[#FBDA00] text-[#000000] font-semibold px-8 py-4 rounded-full hover:bg-[#FACC15] transition-all hover:shadow-[0_4px_20px_rgba(251,218,0,0.4)] flex items-center justify-center min-w-[200px] text-base"
            >
              Mulai Jual
            </Link>
            <Link
              href="/marketplace"
              className="bg-white border border-[#E5E5E5] text-[#0A0A0A] font-semibold px-8 py-4 rounded-full hover:border-[#0A0A0A] transition-colors flex items-center justify-center min-w-[200px] text-base"
            >
              Lihat Katalog
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-10 text-sm text-[#ABABAB]">
            Bergabung dengan <span className="text-[#0A0A0A] font-semibold">2,000+</span> mahasiswa UI
          </p>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A0A0A] tracking-tight">
              Semua yang kamu butuhkan, dalam satu platform.
            </h2>
            <p className="text-[#6B6B6B] mt-4 text-lg max-w-xl mx-auto">
              Dirancang khusus untuk ekosistem kampus UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="bg-white border border-[#E5E5E5] p-8 rounded-3xl hover:border-[#0A0A0A] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-[#FBDA00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0A0A0A]">Marketplace Kampus</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">Jual beli barang bekas dan tawarkan jasa kepada sesama mahasiswa UI.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#E5E5E5] p-8 rounded-3xl hover:border-[#0A0A0A] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-[#FBDA00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0A0A0A]">Reservasi COD</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">Timer otomatis untuk reservasi barang. Tidak ada lagi drama ditikung orang lain.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#E5E5E5] p-8 rounded-3xl hover:border-[#0A0A0A] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-[#FBDA00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0A0A0A]">Komunitas Aktif</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">Berinteraksi, bertanya, dan berbagi informasi di timeline komunitas kampus.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#E5E5E5] p-8 rounded-3xl hover:border-[#0A0A0A] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-[#FBDA00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0A0A0A]">Realtime Chat</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">Komunikasi instan antara buyer dan seller terintegrasi langsung dengan produk.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-5xl mx-auto py-12">
          <div className="bg-[#F5F5F5] rounded-3xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,000+", label: "Mahasiswa" },
              { value: "500+", label: "Produk Aktif" },
              { value: "14", label: "Fakultas" },
              { value: "98%", label: "Transaksi Selesai" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-[#0A0A0A]">{value}</div>
                <div className="text-sm text-[#6B6B6B] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Bottom Section */}
        <section className="max-w-4xl mx-auto py-20 text-center">
          <div className="bg-[#FBDA00] text-black p-14 md:p-20 rounded-[3rem] relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-black/5 rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/5 rounded-full"></div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight relative z-10">
              Siap bergabung?
            </h2>
            <p className="text-lg font-medium mb-10 opacity-70 relative z-10">
              Daftar gratis dan mulai jual beli sekarang.
            </p>
            <Link
              href="/register"
              className="bg-black text-white font-semibold px-10 py-4 rounded-full hover:bg-black/80 transition-colors inline-block text-base relative z-10"
            >
              Daftar Sekarang
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
