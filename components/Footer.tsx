import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">

        {/* Brand */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo-ui.png" alt="Logo UI" className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="h-6 w-px bg-white/20" />
            <span className="font-black text-2xl tracking-tighter text-white">Lapak UI</span>
          </div>
          <p className="text-sm font-medium text-white/60 leading-relaxed max-w-sm">
            Platform marketplace dan komunitas terpercaya khusus mahasiswa Universitas Indonesia. Bangga melayani makara kuning.
          </p>
          <div className="text-xs font-bold text-white/40 space-y-1.5 uppercase tracking-widest">
            <p className="text-[#FBDA00]">Kampus Baru Depok</p>
            <p>Universitas Indonesia, Jawa Barat 16424</p>
          </div>
        </div>

        {/* Fitur */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FBDA00] mb-6">Layanan</h4>
          <ul className="space-y-4 text-sm font-bold text-white/70">
            <li><Link href="/marketplace" className="hover:text-white transition-colors">Katalog Produk</Link></li>
            <li><Link href="/sell" className="hover:text-white transition-colors">Mulai Berjualan</Link></li>
            <li><Link href="/community" className="hover:text-white transition-colors">Forum Mahasiswa</Link></li>
            <li><Link href="/chat" className="hover:text-white transition-colors">Pesan Masuk</Link></li>
          </ul>
        </div>

        {/* Akun */}
        <div className="md:col-span-4">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FBDA00] mb-6">Akses Cepat</h4>
          <ul className="space-y-4 text-sm font-bold text-white/70">
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Pusat Navigasi</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Masuk Akun</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Daftar Baru</Link></li>
            <li><Link href="/notifications" className="hover:text-white transition-colors">Pemberitahuan</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Lapak UI Platform — Universitas Indonesia.
        </p>
        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
          Crafted with passion for UI Students.
        </p>
      </div>
    </footer>
  );
}
