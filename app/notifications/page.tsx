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
  const baseClass = "w-5 h-5 shrink-0";
  
  switch (type) {
    case "RESERVATION_RECEIVED":
      return (
        <div className="bg-blue-50 text-blue-600 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-2.586 2.586a1 1 0 01-.707.293H9.293a1 1 0 01-.707-.293L6 13" />
          </svg>
        </div>
      );
    case "RESERVATION_ACCEPTED":
    case "COD_COMPLETED":
      return (
        <div className="bg-green-50 text-green-600 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "RESERVATION_REJECTED":
      return (
        <div className="bg-red-50 text-red-600 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "RESERVATION_EXPIRED":
      return (
        <div className="bg-amber-50 text-amber-600 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "COD_SELLER_CONFIRMED":
      return (
        <div className="bg-purple-50 text-purple-600 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      );
    case "CHAT_MESSAGE":
    case "POST_REPLIED":
      return (
        <div className="bg-[#FFFBEA] text-black p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    case "POST_LIKED":
      return (
        <div className="bg-red-50 text-red-500 p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.003-.001a3.752 3.752 0 01-2.14-1.121 21.287 21.287 0 01-5.553-6.195 9.016 9.016 0 01-1.15-4.26C2.79 5.328 6.002 2.25 9.945 3.824a6.377 6.377 0 012.33 1.947 6.375 6.375 0 012.33-1.947c3.943-1.574 7.155 1.504 7.155 5.516a9.016 9.016 0 01-1.15 4.26 21.285 21.285 0 01-5.553 6.195 3.751 3.751 0 01-2.14 1.121l-.003.001-.007.003z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="bg-[#F5F5F5] text-[#0A0A0A] p-2 rounded-xl shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
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
