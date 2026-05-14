"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReserveButton({ productId, status }: { productId: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const canReserve = status === "available";

  const handleReserve = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push("/reservations/outgoing");
    } else {
      setError(data.error ?? "Gagal melakukan reservasi.");
    }
  };

  return (
    <div className="flex-1">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleReserve}
        disabled={!canReserve || loading}
        className="w-full bg-[#FBDA00] text-black font-semibold py-3.5 rounded-2xl hover:bg-[#FACC15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : canReserve ? "Reserve Sekarang" : "Tidak Tersedia"}
      </button>
    </div>
  );
}
