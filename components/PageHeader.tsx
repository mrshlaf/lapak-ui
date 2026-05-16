"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl";
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  backHref = "/dashboard",
  backLabel = "Dashboard",
  maxWidth = "max-w-2xl",
  children,
}: PageHeaderProps) {
  const [unreadChats, setUnreadChats] = useState<number>(0);

  useEffect(() => {
    // Ambil data pesan chat belum dibaca
    fetch("/api/chats")
      .then((res) => res.json())
      .then((data) => {
        setUnreadChats(data.unreadCount ?? 0);
      })
      .catch((err) => console.error("Gagal mengambil chat di header:", err));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--color-border)]/50 h-[72px] flex items-center px-6 transition-all duration-300">
      <div className={`${maxWidth} w-full mx-auto flex items-center justify-between gap-6`}>
        {/* Sisi Kiri: Circular Back Button & Stacked Contextual Breadcrumb + Title */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={backHref}
            title={`Kembali ke ${backLabel}`}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[var(--color-border)] hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 active:scale-90 shrink-0 shadow-sm"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em] truncate">
              {backLabel}
            </span>
            <span className="text-xl font-black text-[var(--foreground)] tracking-tighter truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Custom Children + Shortcut Chat & Notifikasi */}
        <div className="flex items-center gap-4 shrink-0">
          {children && <div className="flex items-center gap-3">{children}</div>}

          {/* Pemisah antara children dan icons */}
          {children && <div className="h-6 w-px bg-[var(--color-border)]" />}

          <div className="flex items-center gap-2">
            {/* Shortcut Chat */}
            <Link
              href="/chat"
              title="Pesan Masuk"
              className="relative p-2.5 rounded-full hover:bg-[var(--color-surface-gray)] text-[var(--color-text-secondary)] hover:text-[var(--foreground)] transition-all duration-300 flex items-center justify-center active:scale-95 group"
            >
              <svg className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {unreadChats > 0 && (
                <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[9px] font-black h-4.5 min-w-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[var(--background)] shadow-sm animate-pulse">
                  {unreadChats}
                </span>
              )}
            </Link>

            {/* Modular Floating Dropdown Popover Notification Bell */}
            <NotificationBell />
          </div>
        </div>
      </div>
    </nav>
  );
}
