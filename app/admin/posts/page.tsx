"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Post = {
  id: string; content: string; likeCount: number; createdAt: string;
  author: { id: string; name: string; faculty: string | null };
  _count: { comments: number };
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/posts?limit=50");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deletePost = async (id: string) => {
    if (!confirm("Hapus posting ini?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5] h-16 flex items-center px-6">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-[#6B6B6B] hover:text-[#0A0A0A] text-sm">← Admin</Link>
          <span className="font-bold text-lg text-[#0A0A0A]">Moderasi Post</span>
        </div>
      </nav>

      <div className="pt-16 max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Postingan Komunitas ({posts.length})</h1>
        <div className="space-y-3">
          {loading ? Array(5).fill(0).map((_, i) => <div key={i} className="bg-white h-24 rounded-2xl animate-pulse" />) :
            posts.map((p) => (
              <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0A0A0A]">{p.author.name}</span>
                    <span className="text-xs text-[#ABABAB]">· {p.author.faculty}</span>
                    <span className="text-xs text-[#ABABAB]">· {new Date(p.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-sm text-[#6B6B6B] line-clamp-2">{p.content}</p>
                  <p className="text-xs text-[#ABABAB] mt-1">{p.likeCount} · 💬 {p._count.comments}</p>
                </div>
                <button onClick={() => deletePost(p.id)} className="text-sm text-[#EF4444] border border-[#EF4444] px-3 py-1.5 rounded-full hover:bg-[#EF4444] hover:text-white transition-colors shrink-0 h-fit">
                  Hapus
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
