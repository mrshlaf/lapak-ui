import Link from 'next/link';
import { getSessionFromCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationBell } from './NotificationBell';

export async function Navbar() {
  const session = await getSessionFromCookie();
  
  let user = null;
  if (session) {
    user = await prisma.user.findUnique({ where: { id: session.userId } });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--color-border)]/50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/images/logo-ui.png" alt="Logo UI" className="h-9 w-auto object-contain hover:scale-105 transition-transform" />
          <span className="font-black text-2xl tracking-tighter text-[var(--foreground)]">Lapak UI</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/marketplace" className="text-[15px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Katalog
          </Link>
          <Link href="/community" className="text-[15px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Komunitas
          </Link>
          <Link href="/sell" className="text-[15px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Jual
          </Link>
          <Link href="/chat" className="text-[15px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Chat
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-5">
              <NotificationBell />
              <div className="h-5 w-px bg-[var(--color-border)]" />
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="flex-col items-end hidden md:flex">
                  <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--color-text-secondary)] transition-colors">{user.name.split(' ')[0]}</span>
                  <div className="flex items-center gap-1">
                    {user.role === 'admin' && (
                      <span className="text-[9px] font-black text-[var(--color-primary-accent)] bg-[var(--color-base-dark)] px-1.5 py-0.5 rounded-sm uppercase tracking-widest mr-1">Admin</span>
                    )}
                    <span className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">Dashboard</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-accent)] flex items-center justify-center text-[var(--color-base-dark)] font-black text-lg border border-black/5 shadow-sm group-hover:scale-105 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-[15px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors px-4">
                Masuk
              </Link>
              <Link href="/register" className="text-[15px] font-bold bg-[var(--color-base-dark)] text-white px-6 py-2.5 rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-md">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
