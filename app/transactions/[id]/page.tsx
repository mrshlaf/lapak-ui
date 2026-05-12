"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

type Transaction = {
  id: string;
  status: string;
  finalPrice: number;
  codLocation: string | null;
  codScheduledAt: string | null;
  sellerConfirmedAt: string | null;
  buyerConfirmedAt: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    condition: string;
    images: { imageUrl: string }[];
  } | null;
  buyer: { id: string; name: string; faculty: string | null } | null;
  seller: { id: string; name: string; faculty: string | null } | null;
  reviews: { id: string; rating: number; comment: string | null; reviewerId: string }[];
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(p);
}

const STATUS_STEPS = [
  { key: "on_progress", label: "Reservasi Diterima", desc: "Seller dan buyer sepakat untuk COD" },
  { key: "waiting_buyer_confirm", label: "Seller Konfirmasi COD", desc: "Seller mengkonfirmasi barang sudah diserahkan" },
  { key: "completed", label: "Transaksi Selesai", desc: "Buyer mengkonfirmasi barang sudah diterima" },
];

function StepperBar({ status }: { status: string }) {
  const currentIdx = status === "completed" ? 2 : status === "waiting_buyer_confirm" ? 1 : 0;
  return (
    <div className="flex items-start gap-0 mb-8">
      {STATUS_STEPS.map((step, i) => (
        <div key={step.key} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {i > 0 && <div className={`h-1 flex-1 ${i <= currentIdx ? "bg-[#FBDA00]" : "bg-[#E5E5E5]"}`} />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${i < currentIdx ? "bg-[#22C55E] text-white" : i === currentIdx ? "bg-[#FBDA00] text-black ring-4 ring-[#FBDA00]/20" : "bg-[#E5E5E5] text-[#ABABAB]"}`}>
              {i < currentIdx ? "✓" : i + 1}
            </div>
            {i < STATUS_STEPS.length - 1 && <div className={`h-1 flex-1 ${i < currentIdx ? "bg-[#FBDA00]" : "bg-[#E5E5E5]"}`} />}
          </div>
          <p className={`text-xs mt-2 text-center font-medium ${i <= currentIdx ? "text-[#0A0A0A]" : "text-[#ABABAB]"}`}>{step.label}</p>
        </div>
      ))}
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);
        return (
          <button key={star} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none">
            <svg 
              className={`w-8 h-8 ${active ? "text-[#FBDA00]" : "text-[#E5E5E5]"}`} 
              fill={active ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [codLocation, setCodLocation] = useState("");
  const [codSchedule, setCodSchedule] = useState("");

  // Rating state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  const fetchTx = useCallback(async () => {
    try {
      const [txRes, meRes] = await Promise.all([
        fetch(`/api/transactions/${id}`),
        fetch("/api/auth/me"),
      ]);

      if (!txRes.ok) {
        setTx(null);
        setLoading(false);
        return;
      }

      const txData = await txRes.json();
      setTx(txData.transaction ?? null);
      if (txData.transaction?.codLocation) setCodLocation(txData.transaction.codLocation);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUserId(meData.user?.id ?? "");
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      setTx(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const doAction = async (action: string) => {
    setActionLoading(true);
    await fetch(`/api/transactions/${id}/${action}`, { method: "PUT" });
    await fetchTx();
    setActionLoading(false);
  };

  const saveCodSchedule = async () => {
    setActionLoading(true);
    await fetch(`/api/transactions/${id}/cod-schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codLocation, codScheduledAt: codSchedule }),
    });
    await fetchTx();
    setActionLoading(false);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setRatingLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id, rating, comment }),
    });
    if (res.ok) setRatingDone(true);
    setRatingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#ABABAB]">Memuat transaksi...</div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">❌</div>
        <p className="text-[#0A0A0A] font-semibold">Transaksi tidak ditemukan</p>
        <Link href="/transactions" className="text-sm font-semibold text-[#0A0A0A] bg-white border border-[#E5E5E5] px-5 py-2.5 rounded-full hover:border-[#0A0A0A] hover:bg-[#FAF9F6]/30 transition-all">Kembali</Link>
      </div>
    );
  }

  const isBuyer = tx.buyer?.id === currentUserId;
  const isSeller = tx.seller?.id === currentUserId;
  const alreadyReviewed = tx.reviews.some((r) => r.reviewerId === currentUserId);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Detail Transaksi" backHref="/transactions" backLabel="Transaksi" maxWidth="max-w-2xl" />

      <div className="pt-24 pb-16 max-w-2xl mx-auto px-6 space-y-5">
        {/* Status Stepper */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
          <h2 className="text-sm font-semibold text-[#6B6B6B] mb-5">Status Transaksi</h2>
          <StepperBar status={tx.status} />

          {/* Status info */}
          {tx.status === "on_progress" && (
            <div className="bg-[#FFFBEA] border border-[#FBDA00]/30 rounded-2xl p-4 text-sm text-[#0A0A0A]">
              <p className="font-bold mb-1">Reservasi Aktif — Atur jadwal COD</p>
              <p className="text-[#6B6B6B]">Koordinasikan lokasi dan waktu COD dengan {isBuyer ? "seller" : "buyer"}.</p>
            </div>
          )}
          {tx.status === "waiting_buyer_confirm" && (
            <div className="bg-[#FFFBEA] border border-[#FBDA00]/30 rounded-2xl p-4 text-sm text-[#0A0A0A]">
              <p className="font-bold mb-1">Menunggu Konfirmasi Pembeli</p>
              <p className="text-[#6B6B6B]">Seller sudah mengkonfirmasi COD selesai. {isBuyer ? "Konfirmasi kamu jika sudah menerima barang." : "Tunggu buyer mengkonfirmasi."}</p>
            </div>
          )}
          {tx.status === "completed" && (
            <div className="bg-[#DCFCE7] border border-[#22C55E]/30 rounded-2xl p-4 text-sm text-[#166534]">
              <p className="font-bold">Transaksi Selesai</p>
              <p className="text-[#15803D] mt-1">Selesai pada {tx.buyerConfirmedAt ? new Date(tx.buyerConfirmedAt).toLocaleString("id-ID") : "-"}</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
          <h2 className="text-sm font-semibold text-[#6B6B6B] mb-4">Produk</h2>
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-[#ABABAB]">
              {tx.product?.images?.[0] ? (
                <img src={tx.product.images[0].imageUrl} alt={tx.product.title} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold text-[#0A0A0A]">{tx.product?.title ?? "Produk Dihapus"}</p>
              <p className="text-xl font-bold text-[#0A0A0A] mt-1">{formatPrice(tx.finalPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-[#F5F5F5] rounded-2xl p-3">
              <p className="text-xs text-[#ABABAB] mb-1">Buyer</p>
              <p className="text-sm font-semibold text-[#0A0A0A]">{tx.buyer?.name ?? "-"}</p>
              <p className="text-xs text-[#6B6B6B]">{tx.buyer?.faculty ?? ""}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-2xl p-3">
              <p className="text-xs text-[#ABABAB] mb-1">Seller</p>
              <p className="text-sm font-semibold text-[#0A0A0A]">{tx.seller?.name ?? "-"}</p>
              <p className="text-xs text-[#6B6B6B]">{tx.seller?.faculty ?? ""}</p>
            </div>
          </div>
        </div>

        {/* COD Schedule */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
          <h2 className="text-sm font-semibold text-[#6B6B6B] mb-4">Jadwal COD</h2>
          {tx.codScheduledAt ? (
            <div className="mb-4 bg-[#F5F5F5] rounded-2xl p-4">
              <p className="text-sm text-[#ABABAB]">Waktu</p>
              <p className="font-semibold text-[#0A0A0A]">{new Date(tx.codScheduledAt).toLocaleString("id-ID")}</p>
              {tx.codLocation && <>
                <p className="text-sm text-[#ABABAB] mt-2">Lokasi</p>
                <p className="font-semibold text-[#0A0A0A]">{tx.codLocation}</p>
              </>}
            </div>
          ) : null}

          {tx.status === "on_progress" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#0A0A0A] block mb-1.5">Lokasi COD</label>
                <input value={codLocation} onChange={e => setCodLocation(e.target.value)}
                  placeholder="Contoh: Kantin FT, Perpustakaan UI"
                  className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FBDA00]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#0A0A0A] block mb-1.5">Waktu COD</label>
                <input type="datetime-local" value={codSchedule} onChange={e => setCodSchedule(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#FBDA00]" />
              </div>
              <button onClick={saveCodSchedule} disabled={actionLoading || (!codLocation && !codSchedule)}
                className="w-full border border-[#0A0A0A] text-[#0A0A0A] font-semibold py-3 rounded-2xl text-sm hover:bg-[#0A0A0A] hover:text-white transition-colors disabled:opacity-50">
                Simpan Jadwal COD
              </button>
            </div>
          )}
        </div>

        {/* COD Actions */}
        {tx.status !== "completed" && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
            <h2 className="text-sm font-semibold text-[#6B6B6B] mb-4">Konfirmasi COD</h2>

            {/* Seller confirm */}
            {isSeller && tx.status === "on_progress" && (
              <div>
                <p className="text-sm text-[#6B6B6B] mb-4">
                  Klik tombol ini <strong>setelah</strong> kamu menyerahkan barang ke buyer secara langsung (COD).
                </p>
                <button onClick={() => doAction("seller-confirm")} disabled={actionLoading}
                  className="w-full bg-[#FBDA00] text-black font-semibold py-4 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-60 text-sm">
                  {actionLoading ? "Memproses..." : "Konfirmasi Barang Sudah Diserahkan"}
                </button>
              </div>
            )}

            {/* Buyer confirm */}
            {isBuyer && tx.status === "waiting_buyer_confirm" && (
              <div>
                <p className="text-sm text-[#6B6B6B] mb-4">
                  Klik tombol ini <strong>setelah</strong> kamu menerima barang dari seller. Transaksi akan dinyatakan selesai.
                </p>
                <button onClick={() => doAction("buyer-confirm")} disabled={actionLoading}
                  className="w-full bg-[#22C55E] text-white font-semibold py-4 rounded-2xl hover:bg-[#16A34A] transition-colors disabled:opacity-60 text-sm">
                  {actionLoading ? "Memproses..." : "Konfirmasi Barang Sudah Diterima"}
                </button>
              </div>
            )}

            {/* Waiting messages */}
            {isBuyer && tx.status === "on_progress" && (
              <div className="bg-[#F5F5F5] rounded-2xl p-4 text-sm text-[#6B6B6B] text-center">
                Menunggu seller mengkonfirmasi penyerahan barang...
              </div>
            )}
            {isSeller && tx.status === "waiting_buyer_confirm" && (
              <div className="bg-[#F5F5F5] rounded-2xl p-4 text-sm text-[#6B6B6B] text-center">
                Menunggu buyer mengkonfirmasi penerimaan barang...
              </div>
            )}
          </div>
        )}

        {/* Rating Form — only for buyer after completed */}
        {tx.status === "completed" && isBuyer && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
            <h2 className="text-sm font-semibold text-[#6B6B6B] mb-4">Ulasan untuk Seller</h2>

            {alreadyReviewed || ratingDone ? (
              <div className="text-center py-6 flex flex-col items-center justify-center">
                <div className="text-[#FBDA00] mb-3">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="font-bold text-[#0A0A0A]">Ulasan sudah dikirim</p>
                <p className="text-sm text-[#6B6B6B] mt-1">Terima kasih atas ulasanmu!</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <p className="text-sm text-[#0A0A0A] font-medium mb-3">Seberapa puas kamu dengan transaksi ini?</p>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <p className="text-sm text-[#6B6B6B] font-semibold mt-2.5">
                      {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][rating]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A0A0A] block mb-2">Tulis Ulasan (opsional)</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    rows={3} placeholder="Bagaimana pengalaman transaksi dengan seller ini?"
                    className="w-full bg-[#F5F5F5] rounded-2xl px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#ABABAB] resize-none focus:outline-none focus:ring-2 focus:ring-[#FBDA00]" />
                </div>
                <button type="submit" disabled={!rating || ratingLoading}
                  className="w-full bg-[#FBDA00] text-black font-semibold py-3.5 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-50">
                  {ratingLoading ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews summary if completed */}
        {tx.status === "completed" && tx.reviews.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
            <h2 className="text-sm font-semibold text-[#6B6B6B] mb-4">Ulasan Transaksi Ini</h2>
            {tx.reviews.map((r) => (
              <div key={r.id} className="border-b border-[#F5F5F5] last:border-none pb-4 last:pb-0 mb-4 last:mb-0">
                <div className="flex gap-1 items-center">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} className={`w-4 h-4 ${idx < r.rating ? "text-[#FBDA00]" : "text-[#E5E5E5]"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {r.comment && <p className="text-sm text-[#6B6B6B] mt-2.5 font-medium">&ldquo;{r.comment}&rdquo;</p>}
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
