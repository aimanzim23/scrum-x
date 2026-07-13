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

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildWeekdayStrip(count = 7): Date[] {
  const result: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (result.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) result.unshift(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return result;
}

function lastWeekday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d;
}

export default function Feed() {
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  const dateStrip = buildWeekdayStrip(10);
  const mostRecentWeekday = lastWeekday();
  const mostRecentStr = toDateStr(mostRecentWeekday);

  const [activeProject, setActiveProject] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [selectedProject, setSelectedProject] = useState("METDB");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState(mostRecentStr);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const projectMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateStripRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { phone?: string };
  } | null>(null);

  useEffect(() => {
    if (dateStripRef.current) {
      dateStripRef.current.scrollLeft = dateStripRef.current.scrollWidth;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node))
        setShowProjectMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setShowCalendar(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setUser(data.user);
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
    .filter((post) => activeProject === "All" || post.project === activeProject)
    .filter((post) => {
      if (!selectedDate) return true;
      const postDate = new Date(post.created_at).toDateString();
      return postDate === new Date(selectedDate + "T00:00:00").toDateString();
    });

  function handleDatePickerChange(date: string) {
    if (date) {
      setSelectedDate(date);
      // Scroll to the selected date in the strip if visible
    }
    setShowCalendar(false);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">ScrumX</span>
          <div className="flex items-center gap-1">
            {/* Calendar icon */}
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  showCalendar
                    ? "bg-sky-500/20 text-sky-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {showCalendar && (
                <DatePicker
                  value={selectedDate}
                  onChange={handleDatePickerChange}
                  onClose={() => setShowCalendar(false)}
                  align="right"
                />
              )}
            </div>

            {/* User avatar */}
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
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Date Strip — replaces project tabs */}
        <div className="sticky top-14 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-800">
          <div
            ref={dateStripRef}
            className="flex overflow-x-auto scrollbar-hide"
          >
            {dateStrip.map((d, i) => {
              const str = toDateStr(d);
              const isSelected = str === selectedDate;
              const isToday = str === todayStr;
              const isYesterday = str === yesterdayStr;
              const label = isToday
                ? "Today"
                : isYesterday
                ? "Yesterday"
                : `${DAY_ABBR[d.getDay()]} ${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}`;

              return (
                <button
                  key={str}
                  onClick={() => setSelectedDate(str)}
                  className={`relative shrink-0 px-4 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? "text-white"
                      : isToday
                      ? "text-sky-400 hover:text-sky-300"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {label}
                  {isSelected && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Chips — replaces time filter */}
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-2">
          {["All", "METDB", "Voltraxx", "IFOS2"].map((p) => (
            <button
              key={p}
              onClick={() => setActiveProject(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeProject === p
                  ? "border-sky-500 bg-sky-500/10 text-sky-400"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
              }`}
            >
              {p}
            </button>
          ))}
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
                    <span className="font-bold text-white text-sm">{post.author}</span>
                    <span className="text-zinc-500 text-sm">@{post.handle}</span>
                    <span className="text-zinc-600 text-sm">·</span>
                    <span className="text-zinc-500 text-sm">
                      {(() => {
                        const diffDays = Math.floor(
                          (Date.now() - new Date(post.created_at).getTime()) / 86400000,
                        );
                        if (diffDays === 0) return post.time;
                        if (diffDays <= 7) return `${diffDays}d`;
                        return new Date(post.created_at).toLocaleDateString("en-GB");
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
