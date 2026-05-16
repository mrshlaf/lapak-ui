"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

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

export function NotificationBell() {
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotif, setLoadingNotif] = useState<boolean>(false);

  const fetchUnreadCount = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setUnreadNotifications(data.unreadCount ?? 0);
      })
      .catch((err) => console.error("Gagal mengambil unread notifications:", err));
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll notifications count every 15 seconds for reactive dashboard feel
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotif = async () => {
    if (!isNotifOpen) {
      setLoadingNotif(true);
      setIsNotifOpen(true);
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadNotifications(data.unreadCount ?? 0);
      } catch (err) {
        console.error("Gagal memuat list notifikasi:", err);
      } finally {
        setLoadingNotif(false);
      }
    } else {
      setIsNotifOpen(false);
    }
  };

  const markRead = async (id: string, link?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsNotifOpen(false);
        router.push(link);
      }
    } catch (err) {
      console.error("Gagal menandai notifikasi dibaca:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error("Gagal menandai semua notifikasi dibaca:", err);
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    return `${diffDays}h lalu`;
  };

  return (
    <div className="relative">
      {/* Invisible Overlay to close on Click Outside */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotifOpen(false)} />
      )}

      {/* Bell Button Icon */}
      <button
        onClick={handleToggleNotif}
        title="Notifikasi"
        className={`relative p-2.5 rounded-full transition-all duration-200 flex items-center justify-center active:scale-95 z-50 ${
          isNotifOpen ? "bg-[#F5F5F5] text-[#0A0A0A]" : "text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadNotifications > 0 && (
          <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[9px] font-extrabold h-4 min-w-4 rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
            {unreadNotifications}
          </span>
        )}
      </button>

      {/* Premium Dropdown Popover */}
      {isNotifOpen && (
        <div className="absolute right-0 top-14 w-[340px] md:w-[420px] bg-white border border-[var(--color-border)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-[32px] overflow-hidden z-50 flex flex-col mt-2 origin-top-right transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]/50 bg-[#F9FAFB]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[var(--foreground)] tracking-tight">Pemberitahuan</span>
              {unreadNotifications > 0 && (
                <span className="bg-[#EF4444] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  Baca Semua
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="text-[11px] font-bold text-[var(--foreground)] hover:opacity-70 transition-opacity"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[440px] overflow-y-auto custom-scrollbar bg-white">
            {loadingNotif ? (
              <div className="p-6 space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-10 h-10 bg-[var(--color-surface-gray)] rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-[var(--color-surface-gray)] rounded-lg w-3/4" />
                        <div className="h-3 bg-[var(--color-surface-gray)] rounded-lg w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 bg-[var(--color-surface-gray)] rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[var(--color-text-disabled)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <h4 className="text-sm font-black text-[var(--foreground)] mb-1">Hening Sekali...</h4>
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Belum ada aktivitas terbaru untukmu.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]/30">
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id, n.link)}
                    className={`p-5 transition-all flex gap-4 cursor-pointer relative group ${
                      n.isRead
                        ? "hover:bg-[#F9FAFB]"
                        : "bg-[#FBDA00]/5 hover:bg-[#FBDA00]/10"
                    }`}
                  >
                    <NotificationIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug tracking-tight ${n.isRead ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--foreground)] font-black"}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 font-medium leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[9px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">
                          {timeAgo(n.createdAt)}
                        </p>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Link */}
          <Link
            href="/notifications"
            onClick={() => setIsNotifOpen(false)}
            className="block text-center py-4 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] border-t border-[var(--color-border)]/50"
          >
            Lihat Semua Aktivitas
          </Link>
        </div>
      )}
    </div>
  );
}
