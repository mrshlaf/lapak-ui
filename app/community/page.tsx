"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

type Post = {
  id: string; content: string; likeCount: number; replyCount: number; createdAt: string;
  author: { id: string; name: string; faculty: string | null; profilePicture: string | null };
  images: { imageUrl: string }[];
  _count: { comments: number; likes: number };
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j`;
  return `${Math.floor(h / 24)}h`;
}

function PostCard({ post, onLike, onDelete, isAdmin }: { post: Post; onLike: (id: string) => void; onDelete: (id: string) => void; isAdmin?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ id: string; content: string; author: { id: string; name: string } }[]>([]);
  const [loadingComment, setLoadingComment] = useState(false);

  const loadComments = async () => {
    if (!showComments) {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoadingComment(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setComment("");
    }
    setLoadingComment(false);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${post.author.id}`} className="shrink-0">
          <div className="w-10 h-10 bg-[#FBDA00] hover:bg-[#FACC15] transition-colors rounded-2xl flex items-center justify-center font-black text-sm text-black shadow-sm">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
              <Link href={`/profile/${post.author.id}`} className="font-black text-sm text-[#0A0A0A] hover:text-[#FBDA00] transition-colors">
                {post.author.name}
              </Link>
              {post.author.faculty && (
                <span className="bg-[#F5F5F5] text-[#6B6B6B] font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                  {post.author.faculty}
                </span>
              )}
              <span className="text-[#ABABAB] text-[11px]">{timeAgo(post.createdAt)}</span>
            </div>
            {isAdmin && (
              <button onClick={() => onDelete(post.id)} className="text-[#ABABAB] hover:text-red-500 text-xs font-bold transition-colors shrink-0 px-2 py-0.5 rounded-lg hover:bg-red-50">
                Hapus
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-[#0A0A0A] text-sm leading-relaxed whitespace-pre-line mb-3">
            {post.content}
          </p>

          {/* Images */}
          {post.images.length > 0 && (
            <div className={`grid gap-1.5 mb-3 rounded-2xl overflow-hidden border border-[#E5E5E5] ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {post.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-video bg-[#F5F5F5] overflow-hidden relative group">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 pt-2 border-t border-[#F5F5F5]">
            <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-red-500 transition-colors group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likeCount}
            </button>
            <button onClick={loadComments} className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post._count.comments} Balasan
            </button>
          </div>

          {/* Comments Panel */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[#F5F5F5] space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 items-start text-sm">
                  <div className="w-7 h-7 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-xs font-black text-[#0A0A0A] shrink-0">
                    {c.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-[#F5F5F5] rounded-2xl px-3 py-2 flex-1 min-w-0">
                    <span className="text-xs font-black text-[#0A0A0A]">{c.author.name} </span>
                    <span className="text-sm text-[#0A0A0A] leading-relaxed whitespace-pre-wrap">{c.content}</span>
                  </div>
                </div>
              ))}
              <form onSubmit={submitComment} className="flex gap-2 items-center mt-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tulis balasanmu..."
                  className="flex-1 bg-[#F5F5F5] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBDA00] focus:bg-white transition-all text-[#0A0A0A]"
                />
                <button type="submit" disabled={loadingComment || !comment.trim()} className="bg-[#FBDA00] text-black font-black px-4 py-2 rounded-full text-xs hover:bg-[#FACC15] transition-colors disabled:opacity-60 shrink-0">
                  Balas
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) { setUserRole(d.user.role ?? "user"); setCurrentUserName(d.user.name ?? ""); }
    }).catch(console.error);
  }, []);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") setSelectedImages(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedImages.length === 0) return;
    setPosting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, images: selectedImages }),
    });
    if (res.ok) { setContent(""); setSelectedImages([]); fetchPosts(); }
    setPosting(false);
  };

  const handleLike = async (id: string) => {
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus postingan ini?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) fetchPosts();
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#FBDA00] selection:text-black flex flex-col">

      {/* Cinematic Hero — full dark bottom for overlap */}
      <div className="relative h-[44vh] min-h-[300px] overflow-hidden bg-[#0A0A0A]">
        <img src="/images/ui-images.jpeg" alt="UI Campus" className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative z-10 h-full max-w-3xl mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Komunitas<br />
            <span className="text-[#FBDA00]">Kampus.</span>
          </h1>
          <p className="text-white/55 text-xs md:text-sm font-medium mt-3">
            Diskusikan kosan, event, tips, dan semua hal seputar kehidupan kampus.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto px-6 pb-24 w-full mt-6">

        {/* Compose box */}
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 mb-6 shadow-sm hover:shadow-md focus-within:border-[#0A0A0A]/20 focus-within:shadow-lg transition-all">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#FBDA00] rounded-2xl flex items-center justify-center font-black text-sm text-black shrink-0 shadow-sm">
              {currentUserName ? currentUserName.charAt(0).toUpperCase() : "U"}
            </div>
            <form onSubmit={handlePost} className="flex-1 min-w-0">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
                placeholder="Ada yang ingin kamu bagikan? Cari barang, tawarkan jasa, atau sekadar menyapa..."
                className="w-full bg-transparent text-[#0A0A0A] placeholder-[#ABABAB] resize-none focus:outline-none text-sm leading-relaxed pt-1"
              />

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 my-3">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black transition-colors">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F5F5F5]">
                <label className="cursor-pointer text-[#6B6B6B] hover:text-[#0A0A0A] p-2 rounded-xl hover:bg-[#F5F5F5] transition-colors" title="Tambah foto">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </label>
                <button type="submit" disabled={posting || (!content.trim() && selectedImages.length === 0)} className="bg-[#0A0A0A] text-white font-black px-6 py-2.5 rounded-2xl text-sm hover:bg-[#FBDA00] hover:text-black transition-all disabled:opacity-40 shadow-sm">
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Post count label */}
        {!loading && posts.length > 0 && (
          <p className="text-[10px] font-black text-[#ABABAB] uppercase tracking-[0.25em] mb-4">{posts.length} Postingan</p>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white border border-[#E5E5E5] h-44 rounded-3xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center bg-white border border-[#E5E5E5] rounded-3xl">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-3xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#ABABAB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[#0A0A0A] font-black text-base">Belum ada postingan</p>
            <p className="text-[#ABABAB] text-sm mt-1">Jadilah yang pertama berbagi!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard key={p.id} post={p} onLike={handleLike} onDelete={handleDelete} isAdmin={userRole === "admin"} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
