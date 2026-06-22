"use client";

import { type Post } from "../lib/posts";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import DatePicker from "./DatePicker";
import ShareButton from "./ShareButton";

const PROJECT_COLORS = {
  METDB: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Voltraxx: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  IFOS2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function Feed() {
  const [activeTab, setActiveTab] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [selectedProject, setSelectedProject] = useState("METDB");
  const [posts, setPosts] = useState<Post[]>([]);
  const [timeFilter, setTimeFilter] = useState("Today");
  const [customDate, setCustomDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setShowProjectMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const router = useRouter();
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { phone?: string };
  } | null>(null);
  const [shareMenuId, setShareMenuId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
    }

    fetchPosts();
  }, []);

  const filteredPosts = posts
    .filter((post) => activeTab === "All" || post.project === activeTab)
    .filter((post) => {
      if (timeFilter === "All") return true;
      const postDate = new Date(post.created_at).toDateString();
      if (timeFilter === "Today") return postDate === new Date().toDateString();
      if (timeFilter === "Yesterday")
        return postDate === new Date(Date.now() - 86400000).toDateString();
      if (timeFilter.endsWith("d")) {
        const days = parseInt(timeFilter);
        return (
          postDate === new Date(Date.now() - days * 86400000).toDateString()
        );
      }
      if (timeFilter === "Custom") {
        if (!appliedDate) return true;
        return postDate === new Date(appliedDate + "T00:00:00").toDateString();
      }
      return true;
    });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">ScrumX</span>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold hover:bg-zinc-600 transition-colors"
            >
              {user?.email?.[0].toUpperCase() ?? "?"}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-11 z-20 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-40">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Project Tabs */}
        <nav className="sticky top-14 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex">
          {["All", "METDB", "Voltraxx", "IFOS2"].map((project) => (
            <button
              key={project}
              onClick={() => setActiveTab(project)}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                activeTab === project
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
              }`}
            >
              {project}
              {activeTab === project && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-sky-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Time Filter */}
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-2">
          {["All", "Today", "Yesterday"].map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeFilter(range);
                setShowCalendar(false);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                timeFilter === range
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              {range}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                timeFilter === "Custom"
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {timeFilter === "Custom" && customDate
                ? new Date(customDate + "T00:00:00").toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short" },
                  )
                : "Custom"}
            </button>
            {showCalendar && (
              <DatePicker
                value={customDate}
                onChange={(date) => {
                  setCustomDate(date);
                  setAppliedDate(date);
                  if (date) setTimeFilter("Custom");
                  else setTimeFilter("Today");
                }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
        </div>

        {/* Compose Box */}
        <div className="border-b border-zinc-800 px-4 pt-4 pb-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.email?.[0].toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What did you do today?"
                rows={6}
                maxLength={600}
                className="w-full bg-transparent text-white placeholder-zinc-600 text-sm outline-none resize-none pb-2"
              />
              <p
                className={`text-xs text-right ${600 - newPost.length < 20 ? "text-red-400" : "text-zinc-600"}`}
              >
                {600 - newPost.length}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="relative" ref={projectMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowProjectMenu(!showProjectMenu)}
                    className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-sky-400 text-sm font-medium rounded-full px-4 py-1.5 hover:border-zinc-500 transition-colors"
                  >
                    {selectedProject}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showProjectMenu && (
                    <div className="absolute left-0 bottom-10 z-20 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-36">
                      {["METDB", "Voltraxx", "IFOS2"].map((p) => (
                        <button
                          key={p}
                          onClick={() => { setSelectedProject(p); setShowProjectMenu(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            selectedProject === p
                              ? "text-sky-400 bg-sky-500/10"
                              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  disabled={!newPost.trim()}
                  onClick={async () => {
                    if (!newPost.trim()) return;

                    const { data, error } = await supabase
                      .from("posts")
                      .insert({
                        author: user?.email ?? "unknown",
                        handle: user?.email?.split("@")[0] ?? "unknown",
                        phone: user?.user_metadata?.phone ?? null,
                        project: selectedProject,
                        time: new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        text: newPost,
                      })
                      .select()
                      .single();

                    console.log("data:", data);
                    console.log("error:", error);

                    if (data) setPosts([data, ...posts]);
                    setNewPost("");
                  }}
                  className="bg-sky-500 text-white text-sm font-bold px-5 py-1.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <main>
          {filteredPosts.length === 0 && (
            <p className="py-16 text-center text-zinc-600 text-sm">
              No reports yet.
            </p>
          )}
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => router.push(`/post/${post.id}`)}
              className="px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {post.author}
                    </span>
                    <span className="text-zinc-500 text-sm">
                      @{post.handle}
                    </span>
                    <span className="text-zinc-600 text-sm">·</span>
                    <span className="text-zinc-500 text-sm">
                      {(() => {
                        const diffDays = Math.floor(
                          (Date.now() - new Date(post.created_at).getTime()) /
                            86400000,
                        );
                        if (diffDays === 0) return post.time;
                        if (diffDays <= 7) return `${diffDays}d`;
                        return new Date(post.created_at).toLocaleDateString(
                          "en-GB",
                        );
                      })()}
                    </span>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${PROJECT_COLORS[post.project as keyof typeof PROJECT_COLORS]}`}
                    >
                      {post.project}
                    </span>
                    <ShareButton
                      phone={post.phone}
                      text={post.text}
                      postId={post.id}
                      handle={post.handle}
                      onDelete={() => setPosts(posts.filter((p) => p.id !== post.id))}
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">
                    {post.text}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
