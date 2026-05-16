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
    <div className="pt-28 max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#0A0A0A] transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </Link>
            Moderasi Post
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-2">{posts.length} postingan komunitas aktif.</p>
        </div>
      </div>
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
                  <p className="text-xs text-[#ABABAB] mt-1 flex items-center gap-1">{p.likeCount} · <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> {p._count.comments}</p>
                </div>
                <button onClick={() => deletePost(p.id)} className="text-sm text-[#EF4444] border border-[#EF4444] px-3 py-1.5 rounded-full hover:bg-[#EF4444] hover:text-white transition-colors shrink-0 h-fit">
                  Hapus
                </button>
              </div>
            ))}
        </div>
    </div>
  );
}
