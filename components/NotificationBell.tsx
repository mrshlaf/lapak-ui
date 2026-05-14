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
  const baseClass = "w-4 h-4";
  switch (type) {
    case "CHAT_MESSAGE":
      return (
        <div className="bg-[#FFFBEA] text-[#D09B00] p-1.5 rounded-lg shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
        <div className="bg-[#EEF2FF] text-[#4F46E5] p-1.5 rounded-lg shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
      );
    case "TRANSACTION_STATUS":
    case "COD_SELLER_CONFIRMED":
    case "COD_COMPLETED":
      return (
        <div className="bg-[#ECFDF5] text-[#059669] p-1.5 rounded-lg shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="bg-[#F5F5F5] text-[#0A0A0A] p-1.5 rounded-lg shrink-0">
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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

      {/* Glassmorphic Dropdown Popover */}
      {isNotifOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white/95 backdrop-blur-md border border-[#E5E5E5] shadow-xl rounded-2xl py-4 z-50 flex flex-col mt-1">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[#E5E5E5]">
            <span className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">Notifikasi</span>
            <div className="flex items-center gap-3">
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
                >
                  Tandai semua dibaca
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="text-[10px] font-bold text-[#0A0A0A] hover:opacity-80 transition-opacity"
              >
                Lihat semua
              </Link>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto pr-1 py-1">
            {loadingNotif ? (
              <div className="space-y-2 p-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5 py-1">
                        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <span className="text-2xl mb-2 block">🔔</span>
                <h4 className="text-xs font-bold text-[#0A0A0A] mb-0.5">Tidak ada notifikasi</h4>
                <p className="text-[10px] text-[#6B6B6B]">Kamu akan melihat pemberitahuan di sini.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F5] px-1">
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id, n.link)}
                    className={`p-3 rounded-xl transition-all flex gap-3 cursor-pointer items-start my-0.5 ${
                      n.isRead
                        ? "hover:bg-[#F5F5F5]"
                        : "bg-[#FFFBEA]/70 hover:bg-[#FFFBEA] border-l-2 border-[#FBDA00] pl-2.5"
                    }`}
                  >
                    <NotificationIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-[#0A0A0A] leading-snug ${n.isRead ? "font-medium" : "font-extrabold"}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[9px] font-bold text-[#ABABAB] mt-1.5 uppercase tracking-wider">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-[#FBDA00] rounded-full shrink-0 mt-1 shadow-sm" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
