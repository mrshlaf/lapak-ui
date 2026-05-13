"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

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
  if (m < 60) return `${m}m yang lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j yang lalu`;
  return `${Math.floor(h / 24)}d yang lalu`;
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

  // Convert name to a simple twitter-like handle (e.g. "@sapita_ui")
  const authorHandle = `@${post.author.name.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:bg-[#FAF9F6]/30 transition-colors">
      <div className="flex gap-4">
        {/* Left Side: Avatar */}
        <Link href={`/profile/${post.author.id}`} className="shrink-0">
          <div className="w-10 h-10 bg-[#FBDA00] hover:bg-[#FACC15] transition-colors rounded-full flex items-center justify-center font-bold text-sm text-black">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        {/* Right Side: Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header row: Author info */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-baseline flex-wrap gap-x-2 text-sm">
              <Link href={`/profile/${post.author.id}`} className="font-bold text-[#0A0A0A] hover:text-[#6B6B6B] transition-colors">
                {post.author.name}
              </Link>
              <span className="text-[#6B6B6B] text-xs font-normal">{authorHandle}</span>
              <span className="text-[#ABABAB] text-xs">·</span>
              <span className="text-[#6B6B6B] text-xs font-normal">{timeAgo(post.createdAt)}</span>
              <span className="bg-[#F5F5F5] text-[#0A0A0A] font-semibold px-2 py-0.5 rounded-full text-[10px] ml-1">
                {post.author.faculty ?? "UI"}
              </span>
            </div>

            {isAdmin && (
              <button 
                onClick={() => onDelete(post.id)} 
                className="text-[#ABABAB] hover:text-[#EF4444] text-xs font-semibold transition-colors shrink-0"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Post Content */}
          <p className="text-[#0A0A0A] text-[15px] leading-relaxed whitespace-pre-line mb-3.5">
            {post.content}
          </p>

          {/* Attached Images */}
          {post.images.length > 0 && (
            <div className={`grid gap-2 mb-4 rounded-2xl overflow-hidden border border-[#E5E5E5] ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {post.images.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-video bg-[#F5F5F5] overflow-hidden relative group">
                  <img src={img.imageUrl} alt={`Attached`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* Action Row - Clean vector twitter action-style bar */}
          <div className="flex items-center justify-start gap-12 pt-1 border-t border-[#F5F5F5] mt-1.5">
            {/* Likes */}
            <button 
              onClick={() => onLike(post.id)} 
              className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#EF4444] transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-[#EF4444]/10 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 text-[#ABABAB] group-hover:text-[#EF4444] transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="group-hover:text-[#EF4444]">{post.likeCount}</span>
            </button>

            {/* Replies */}
            <button 
              onClick={loadComments} 
              className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#1D9BF0] transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-[#1D9BF0]/10 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4 text-[#ABABAB] group-hover:text-[#1D9BF0] transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="group-hover:text-[#1D9BF0]">{post._count.comments} Balasan</span>
            </button>
          </div>

          {/* Comments Panel */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-[#F5F5F5] space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start text-sm">
                  <Link href={`/profile/${c.author.id}`} className="shrink-0">
                    <div className="w-8 h-8 bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors rounded-full flex items-center justify-center text-xs font-bold text-[#0A0A0A]">
                      {c.author.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div className="bg-[#F5F5F5] rounded-2xl px-4 py-2.5 flex-1 min-w-0">
                    <Link href={`/profile/${c.author.id}`} className="hover:underline inline-block mb-0.5">
                      <span className="text-xs font-bold text-[#0A0A0A]">{c.author.name}</span>
                    </Link>
                    <p className="text-sm text-[#0A0A0A] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  </div>
                </div>
              ))}

              {/* Add comment reply */}
              <form onSubmit={submitComment} className="flex gap-3 items-center mt-3">
                <input 
                  value={comment} 
                  onChange={e => setComment(e.target.value)} 
                  placeholder="Tulis balasanmu..." 
                  className="flex-1 bg-[#F5F5F5] rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FBDA00] focus:bg-white transition-all text-[#0A0A0A]" 
                />
                <button 
                  type="submit" 
                  disabled={loadingComment || !comment.trim()} 
                  className="bg-[#FBDA00] text-black font-semibold px-5 py-2.5 rounded-full text-xs hover:bg-[#FACC15] transition-colors disabled:opacity-60 shrink-0"
                >
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
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUserRole(d.user.role ?? "user");
          setCurrentUserName(d.user.name ?? "Me");
        }
      })
      .catch(err => console.error("Gagal mengambil data user:", err));
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
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setSelectedImages(prev => [...prev, reader.result as string].slice(0, 4)); // max 4 foto
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
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
    if (res.ok) { 
      setContent(""); 
      setSelectedImages([]);
      fetchPosts(); 
    }
    setPosting(false);
  };

  const handleLike = async (id: string) => {
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus postingan ini? (Tindakan Admin)")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPosts();
    } else {
      const data = await res.json();
      alert(data.error ?? "Gagal menghapus postingan.");
    }
  };

  const isAdmin = userRole === "admin";

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      <div>
      <PageHeader title="Komunitas" maxWidth="max-w-2xl" />

      <div className="pt-24 pb-16 max-w-2xl mx-auto px-6">
        {/* Compose Twitter Benchmark Box */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 mb-6">
          <div className="flex gap-4">
            {/* User Initial Avatar */}
            <div className="w-10 h-10 bg-[#FBDA00] rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0">
              {currentUserName ? currentUserName.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Form */}
            <form onSubmit={handlePost} className="flex-1 min-w-0">
              <textarea
                value={content} 
                onChange={e => setContent(e.target.value)} 
                rows={3}
                placeholder="Ada yang ingin kamu bagikan? Cari barang, tawarkan jasa, atau sekadar menyapa..."
                className="w-full bg-transparent text-[#0A0A0A] placeholder-[#ABABAB] resize-none focus:outline-none text-[15px] leading-relaxed pt-1"
              />

              {/* Previews of Selected Images */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 my-3">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5] group">
                      <img src={img} alt="Selected preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white hover:bg-black p-1.5 rounded-full transition-colors flex items-center justify-center shadow"
                        title="Hapus foto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action row with Camera Icon and post button */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F5F5F5]">
                <div className="flex items-center gap-1.5">
                  <label className="cursor-pointer text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center" title="Tambah foto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {selectedImages.length > 0 && (
                    <span className="text-[11px] text-[#ABABAB] font-bold uppercase tracking-wider">{selectedImages.length} / 4 foto</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={posting || (!content.trim() && selectedImages.length === 0)} 
                  className="bg-[#FBDA00] text-black font-semibold px-6 py-2 rounded-full text-sm hover:bg-[#FACC15] transition-colors disabled:opacity-60 shadow-sm"
                >
                  {posting ? "Memposting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Timeline Posts */}
        {loading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E5E5] h-44 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center bg-white border border-[#E5E5E5] rounded-3xl">
            <div className="text-[#ABABAB] mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[#6B6B6B] text-sm">Belum ada postingan. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                onLike={handleLike}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
}
