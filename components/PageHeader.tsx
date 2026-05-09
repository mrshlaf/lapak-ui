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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] h-16 flex items-center px-6 shadow-sm">
      <div className={`${maxWidth} w-full mx-auto flex items-center justify-between gap-6`}>
        {/* Sisi Kiri: Circular Back Button & Stacked Contextual Breadcrumb + Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href={backHref}
            title={`Kembali ke ${backLabel}`}
            className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#E5E5E5] bg-white hover:border-[#0A0A0A] hover:bg-[#FAF9F6]/30 hover:shadow-sm transition-all duration-200 active:scale-90 shrink-0"
          >
            <svg
              className="w-4.5 h-4.5 text-[#6B6B6B] group-hover:text-[#0A0A0A] group-hover:-translate-x-0.5 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex flex-col min-w-0 leading-none">
            <span className="text-[9px] font-extrabold text-[#9B9B9B] uppercase tracking-widest truncate">
              {backLabel}
            </span>
            <span className="text-sm font-bold text-[#0A0A0A] tracking-tight mt-0.5 truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Custom Children + Shortcut Chat & Notifikasi */}
        <div className="flex items-center gap-4 shrink-0">
          {children && <div className="flex items-center gap-3">{children}</div>}

          {/* Pemisah antara children dan icons */}
          {children && <div className="h-5 w-px bg-[#E5E5E5]" />}

          <div className="flex items-center gap-1.5">
            {/* Shortcut Chat */}
            <Link
              href="/chat"
              title="Pesan Masuk"
              className="relative p-2.5 rounded-full hover:bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#0A0A0A] transition-all duration-200 flex items-center justify-center active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {unreadChats > 0 && (
                <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[9px] font-extrabold h-4 min-w-4 rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
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
