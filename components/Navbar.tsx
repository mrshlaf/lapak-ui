import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/images/logo-ui.png" alt="Logo UI" className="h-9 w-auto object-contain hover:scale-105 transition-transform" />
          <div className="h-5 w-px bg-[#E5E5E5]" />
          <span className="font-extrabold text-xl tracking-tight text-[#0A0A0A]">Lapak UI</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/marketplace" className="text-[15px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
            Katalog
          </Link>
          <Link href="/community" className="text-[15px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
            Komunitas
          </Link>
          <Link href="/sell" className="text-[15px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
            Jual
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-[15px] font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="text-[15px] font-bold bg-[#FBDA00] text-[#000000] px-5 py-2 rounded-full hover:bg-[#FACC15] transition-colors">
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
}
