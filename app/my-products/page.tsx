import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";

function formatPrice(p: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p);
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  available: { label: "Tersedia", color: "bg-[#22C55E] text-white" },
  reserved: { label: "Reserved", color: "bg-[#FBDA00] text-black" },
  on_progress: { label: "Proses", color: "bg-orange-400 text-white" },
  completed: { label: "Terjual", color: "bg-[#6B6B6B] text-white" },
  cancelled: { label: "Dibatalkan", color: "bg-red-200 text-red-800" },
};

export default async function MyProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({
    where: { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      _count: { select: { reservations: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
        <PageHeader title="Produk Saya" maxWidth="max-w-5xl">
          <Link href="/sell" className="bg-[#FBDA00] text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-[#FACC15] transition-colors">
            + Jual Baru
          </Link>
        </PageHeader>

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Produk Saya ({products.length})</h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E5E5E5]">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Belum ada produk</h3>
            <p className="text-[#6B6B6B] mb-6">Mulai jual barang atau tawarkan jasamu</p>
            <Link href="/sell" className="bg-[#FBDA00] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#FACC15] transition-colors">
              Upload Produk Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => {
              const s = STATUS_MAP[p.status] ?? { label: p.status, color: "bg-gray-200 text-gray-800" };
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-[#E5E5E5] p-5 flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0">
                    {p.images[0] ? (
                      <img src={p.images[0].imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0A0A0A] truncate">{p.title}</h3>
                    <p className="text-sm text-[#6B6B6B]">{formatPrice(p.price)} · {p._count.reservations} reservasi</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${s.color}`}>{s.label}</span>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/marketplace/${p.id}`} className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A] border border-[#E5E5E5] px-3 py-1.5 rounded-full transition-colors">
                      Lihat
                    </Link>
                    <Link href={`/sell/${p.id}/edit`} className="text-sm text-[#0A0A0A] border border-[#0A0A0A] px-3 py-1.5 rounded-full hover:bg-[#0A0A0A] hover:text-white transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
