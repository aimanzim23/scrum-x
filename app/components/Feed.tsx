"use client";

import { type Post, defaultPosts } from "../lib/posts";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const PROJECT_COLORS = {
  METDB: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Voltraxx: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  IFOS2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function Feed() {
  const [activeTab, setActiveTab] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [selectedProject, setSelectedProject] = useState("METDB");
  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [timeFilter, setTimeFilter] = useState("Today");
  const router = useRouter();
  const [customDate, setCustomDate] = useState("");

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
      if (timeFilter === "Yesterday") return postDate === new Date(Date.now() - 86400000).toDateString();
      if (timeFilter === "Custom") {
        if (!customDate) return true;
        return postDate === new Date(customDate + "T00:00:00").toDateString();
      }
      return true;
    });


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">ScrumX</span>
          <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold">
            AH
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
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === project
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
        <div className="border-b border-zinc-800 px-4 py-3 space-y-2">
          <div className="flex gap-2">
            {["All", "Today", "Yesterday", "Custom"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  timeFilter === range
                    ? "border-sky-500 bg-sky-500/10 text-sky-400"
                    : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {timeFilter === "Custom" && (
            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-zinc-500">Pick a date</label>
              <input
                type="date"
                value={customDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCustomDate(e.target.value)}
                className="text-xs bg-zinc-900 border border-zinc-700 text-sky-400 rounded-lg px-3 py-1.5 outline-none focus:border-sky-500 transition-colors cursor-pointer"
              />
              {customDate && (
                <button
                  onClick={() => setCustomDate("")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Compose Box */}
        <div className="border-b border-zinc-800 px-4 pt-4 pb-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
              AH
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What did you do today?"
                rows={6}
                className="w-full bg-transparent text-white placeholder-zinc-600 text-sm outline-none resize-none pb-2"
              />
              <p
                className={`text-xs text-right ${280 - newPost.length < 20 ? "text-red-400" : "text-zinc-600"}`}
              >
                {280 - newPost.length}
              </p>
              <div className="flex items-center justify-between pt-1">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sky-400 text-sm rounded-full px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="METDB">METDB</option>
                  <option value="Voltraxx">Voltraxx</option>
                  <option value="IFOS2">IFOS2</option>
                </select>
                <button
                  disabled={!newPost.trim()}
                  onClick={async () => {
                    if (!newPost.trim()) return;

                    const { data, error } = await supabase
                      .from("posts")
                      .insert({
                        author: "Aiman Hazim",
                        handle: "aimanhazim",
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
                  className="bg-sky-500 text-white text-sm font-bold px-5 py-1.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed "
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
            <article key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors cursor-pointer">
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
                          const diffDays = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 86400000);
                          if (diffDays === 0) return post.time;
                          if (diffDays <= 7) return `${diffDays}d`;
                          return new Date(post.created_at).toLocaleDateString("en-GB");
                        })()}
                      </span>
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${PROJECT_COLORS[post.project]}`}
                      >
                        {post.project}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">
                      {post.text}
                    </p>
                    {post.phone && (
                      <a
                        href={`https://wa.me/${post.phone}?text=${encodeURIComponent(`Regarding your scrum update:\n\n${post.text.split("\n").map((line) => `> ${line}`).join("\n")}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Contact on WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
