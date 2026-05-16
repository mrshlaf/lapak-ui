"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Notification = {
  id: string; type: string; title: string | null; message: string | null;
  link: string | null; isRead: boolean; createdAt: string;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function NotificationIcon({ type }: { type: string }) {
  const baseClass = "w-5 h-5 text-[#0A0A0A]";
  const containerClass = "bg-[#F5F5F5] w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center border border-[#E5E5E5]/50 shadow-sm";
  
  switch (type) {
    case "CHAT_MESSAGE":
      return (
        <div className={containerClass}>
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
      );
    case "RESERVATION_STATUS":
    case "RESERVATION_RECEIVED":
    case "RESERVATION_ACCEPTED":
    case "RESERVATION_REJECTED":
    case "RESERVATION_EXPIRED":
      return (
        <div className={containerClass}>
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
      );
    case "TRANSACTION_STATUS":
    case "COD_SELLER_CONFIRMED":
    case "COD_COMPLETED":
      return (
        <div className={containerClass}>
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "POST_LIKED":
      return (
        <div className={containerClass}>
          <svg className="w-5 h-5 text-[#E11D48]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
      );
    case "POST_REPLIED":
      return (
        <div className={containerClass}>
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={containerClass}>
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
      );
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PUT" });
    fetchData();
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col justify-between">
      <div>
        <PageHeader title="Notifikasi" maxWidth="max-w-2xl">
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <span className="bg-[#EF4444] text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 uppercase tracking-wider">
                {unreadCount} Baru
              </span>
            )}
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-bold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
                Tandai semua dibaca
              </button>
            )}
          </div>
        </PageHeader>

      {/* Content Area */}
      <div className="pt-24 pb-16 max-w-2xl mx-auto px-6">
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E5E5] h-20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-16 text-center flex flex-col items-center justify-center my-4">
            <div className="text-[#ABABAB] mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">Tidak ada notifikasi</h3>
            <p className="text-xs text-[#6B6B6B]">Kamu akan melihat pemberitahuan aktivitas akunmu di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => !n.isRead && markRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead 
                    ? "bg-white border-[#E5E5E5]" 
                    : "bg-[#FFFBEA]/80 border-[#FBDA00]/30 hover:bg-[#FFFBEA]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Premium Monochrome/Color Accent Vector Icon */}
                  <NotificationIcon type={n.type} />
                  
                  <div className="flex-1 min-w-0">
                    {n.link ? (
                      <Link href={n.link} className="block group">
                        <p className="text-sm font-semibold text-[#0A0A0A]">{n.title}</p>
                        {n.message && <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{n.message}</p>}
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[#0A0A0A]">{n.title}</p>
                        {n.message && <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{n.message}</p>}
                      </>
                    )}
                    <p className="text-[10px] font-bold text-[#ABABAB] mt-2 uppercase tracking-wider">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 bg-[#FBDA00] rounded-full shrink-0 mt-1.5 shadow-sm" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
