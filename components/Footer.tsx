import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-white py-16 px-6 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Kolom 1: Profil & Alamat Resmi UI (5 Cols) */}
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-3">
            <img src="/images/logo-ui.png" alt="Logo UI" className="h-9 w-auto object-contain" />
            <div className="h-5 w-px bg-[#E5E5E5]" />
            <span className="font-extrabold text-xl tracking-tight text-[#0A0A0A]">Lapak UI</span>
          </div>
          <p className="text-sm font-semibold text-[#6B6B6B] leading-relaxed max-w-sm">
            Platform marketplace dan komunitas terpercaya khusus mahasiswa Universitas Indonesia. Jual beli mudah, aman, dan terintegrasi langsung di lingkungan kampus.
          </p>
          <div className="space-y-2 text-xs font-semibold text-[#ABABAB] leading-relaxed">
            <p className="text-[#6B6B6B] font-bold">Kampus Baru Depok</p>
            <p>Universitas Indonesia, Jawa Barat 16424, Indonesia</p>
            <p className="pt-1">
              Email:{" "}
              <a href="mailto:sipp@ui.ac.id" className="text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">sipp@ui.ac.id</a> /{" "}
              <a href="mailto:humas-ui@ui.ac.id" className="text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">humas-ui@ui.ac.id</a>
            </p>
            <p>
              Hubungi:{" "}
              <span className="text-[#6B6B6B]">021-1500002</span> /{" "}
              <a href="https://wa.me/6281515000002" target="_blank" rel="noopener noreferrer" className="text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors font-bold">
                +62 815 1500 0002 (WhatsApp)
              </a>
            </p>
          </div>
        </div>

        {/* Kolom 2: Fitur Utama (2 Cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] mb-4">Fitur Utama</h4>
          <ul className="space-y-3 text-sm font-semibold text-[#6B6B6B]">
            <li><Link href="/marketplace" className="hover:text-[#0A0A0A] transition-colors">Marketplace Katalog</Link></li>
            <li><Link href="/community" className="hover:text-[#0A0A0A] transition-colors">Komunitas Forum</Link></li>
            <li><Link href="/chat" className="hover:text-[#0A0A0A] transition-colors">Obrolan Realtime</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Universitas Indonesia (3 Cols) */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] mb-4">Tentang UI</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-semibold text-[#6B6B6B]">
            <ul className="space-y-3">
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Akademik</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Riset & Inovasi</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Kampus</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">People</span></li>
            </ul>
            <ul className="space-y-3">
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Tentang UI</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Fasilitas</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Mitra</span></li>
              <li><span className="cursor-default hover:text-[#0A0A0A] transition-colors">Karir</span></li>
            </ul>
          </div>
        </div>

        {/* Kolom 4: Dukungan & Akun (2 Cols) */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0A0A0A] mb-4">Dukungan</h4>
          <ul className="space-y-3 text-sm font-semibold text-[#6B6B6B]">
            <li><Link href="/profile" className="hover:text-[#0A0A0A] transition-colors">Hubungkan Telegram</Link></li>
            <li><Link href="/profile" className="hover:text-[#0A0A0A] transition-colors">Pengaturan Profil</Link></li>
            <li><Link href="/marketplace" className="hover:text-[#0A0A0A] transition-colors">Syarat & Ketentuan</Link></li>
          </ul>
        </div>

      </div>

      {/* Bagian Bawah: Hak Cipta UI Resmi */}
      <div className="max-w-7xl mx-auto border-t border-[#E5E5E5]/60 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#ABABAB] font-semibold">
          &copy; {new Date().getFullYear()} Hak Cipta, Universitas Indonesia. All rights reserved.
        </p>
        <p className="text-xs text-[#ABABAB] font-semibold">
          Fakultas Teknik Universitas Indonesia
        </p>
      </div>
    </footer>
  );
}
