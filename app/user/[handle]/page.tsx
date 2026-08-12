"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  getPublishedPostsByHandle, getDraftsByHandle, getProfileStats, PAGE_SIZE,
} from "../../lib/posts";
import { getAvatarConfig, saveAvatarConfig } from "../../lib/avatar";
import type { Post } from "../../lib/posts";
import type { AvatarConfig } from "../../lib/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import UserAvatar from "../../components/UserAvatar";
import AvatarPicker from "../../components/AvatarPicker";

function PostCard({ post, handle, config, onNavigate }: {
  post: Post; handle: string; config: AvatarConfig; onNavigate: (id: number) => void;
}) {
  const diffDays = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 86400000);
  const dateLabel = diffDays === 0 ? post.time : diffDays <= 7 ? `${diffDays}d` : new Date(post.created_at).toLocaleDateString("en-GB");

  return (
    <article
      onClick={() => onNavigate(post.id)}
      className="px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        <UserAvatar handle={handle} config={config} size={32} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-tight">
            {handle.charAt(0).toUpperCase() + handle.slice(1)}
            <span className="font-normal text-zinc-500 ml-1.5">@{handle}</span>
            <span className="font-normal text-zinc-600 ml-1.5">·</span>
            <span className="font-normal text-zinc-500 ml-1.5">{dateLabel}</span>
          </p>
          <div className="mt-1 text-sm text-zinc-300 prose prose-invert prose-sm max-w-none break-words">
            <ReactMarkdown>{post.text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function UserProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const router = useRouter();

  const [published, setPublished] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({ variant: "beam", palette: "sky" });
  const [showPicker, setShowPicker] = useState(false);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const own = user.email?.split("@")[0] === handle;
      setIsOwnProfile(own);

      const [rows, draftRows, stats, config] = await Promise.all([
        getPublishedPostsByHandle(handle, 0),
        own ? getDraftsByHandle(handle) : Promise.resolve([]),
        getProfileStats(handle),
        getAvatarConfig(handle),
      ]);

      setPublished(rows);
      setDrafts(draftRows);
      setTotalPosts(stats.totalPosts);
      setAllProjects(stats.projects);
      setAvatarConfig(config);
      offsetRef.current = rows.length;
      hasMoreRef.current = rows.length === PAGE_SIZE;
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    }
    load();
  }, [handle]);

  useEffect(() => {
    if (loading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || isFetchingRef.current || !hasMoreRef.current) return;
        isFetchingRef.current = true;
        setLoadingMore(true);
        const rows = await getPublishedPostsByHandle(handle, offsetRef.current);
        setPublished((prev) => [...prev, ...rows]);
        offsetRef.current += rows.length;
        hasMoreRef.current = rows.length === PAGE_SIZE;
        setHasMore(rows.length === PAGE_SIZE);
        setLoadingMore(false);
        isFetchingRef.current = false;
      },
      { rootMargin: "0px 0px 500px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, handle]);

  async function handleSaveAvatar(config: AvatarConfig) {
    await saveAvatarConfig(handle, config);
    setAvatarConfig(config);
  }

  const projects = ["All", ...allProjects];
  const tabs = isOwnProfile && drafts.length > 0 ? [...projects, "Drafts"] : projects;
  const visiblePosts =
    activeTab === "Drafts" ? drafts
    : activeTab === "All" ? published
    : published.filter((p) => p.project === activeTab);

  const navigate = (id: number) => router.push(`/post/${id}`);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur px-4 py-3 flex items-center gap-4 border-b border-zinc-800">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">←</Link>
          <div>
            <p className="font-bold text-white text-sm leading-tight">
              {handle.charAt(0).toUpperCase() + handle.slice(1)}
            </p>
            {!loading && <p className="text-zinc-500 text-xs">{totalPosts} posts</p>}
          </div>
        </div>

        {/* Profile hero */}
        {loading ? (
          <div className="px-4 pt-6 pb-4 border-b border-zinc-800">
            <Skeleton className="w-16 h-16 rounded-full bg-zinc-800 mb-3" />
            <Skeleton className="h-4 w-32 bg-zinc-800 mb-2" />
            <Skeleton className="h-3 w-20 bg-zinc-800 mb-3" />
            <Skeleton className="h-3 w-40 bg-zinc-800" />
          </div>
        ) : (
          <div className="relative px-4 pt-6 pb-4 border-b border-zinc-800">
            {isOwnProfile && (
              <button
                onClick={() => setShowPicker((v) => !v)}
                className="absolute top-4 right-4 px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm rounded-full transition-colors"
              >
                Change avatar
              </button>
            )}
            <UserAvatar handle={handle} config={avatarConfig} size={64} />
            <p className="font-bold text-white text-xl leading-tight mt-3">
              {handle.charAt(0).toUpperCase() + handle.slice(1)}
            </p>
            <p className="text-zinc-500 text-sm mt-0.5">@{handle}</p>
            <p className="text-zinc-400 text-sm mt-3">
              <span className="font-semibold text-white">{totalPosts}</span>
              <span className="text-zinc-500"> posts · </span>
              <span className="font-semibold text-white">{allProjects.length}</span>
              <span className="text-zinc-500"> projects</span>
            </p>

            {isOwnProfile && showPicker && (
              <AvatarPicker
                handle={handle}
                current={avatarConfig}
                onSave={handleSaveAvatar}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>
        )}

        {/* Project tabs */}
        {!loading && tabs.length > 1 && (
          <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab ? "border-sky-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Post list */}
        {loading ? (
          <div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-4 border-b border-zinc-800 flex gap-3">
                <Skeleton className="size-8 rounded-full shrink-0 bg-zinc-800" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-3 w-36 bg-zinc-800" />
                  <Skeleton className="h-3 w-full bg-zinc-800" />
                  <Skeleton className="h-3 w-4/5 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-2">
            <p className="text-white font-bold text-lg">No posts yet</p>
            <p className="text-zinc-500 text-sm">
              {isOwnProfile ? "Your posts will show up here." : `@${handle} hasn't posted yet.`}
            </p>
          </div>
        ) : (
          <section>
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} handle={handle} config={avatarConfig} onNavigate={navigate} />
            ))}
            <div ref={sentinelRef} />
            <div className="py-6 flex items-center justify-center min-h-[52px]">
              {loadingMore ? (
                <svg className="animate-spin size-5 text-sky-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : !hasMore && activeTab !== "Drafts" ? (
                <p className="text-zinc-600 text-xs">— you've reached the end —</p>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
