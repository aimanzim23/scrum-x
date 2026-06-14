"use client";

import { useState } from "react";
interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [selectedProject, setSelectedProject] = useState("METDB");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 3,
      author: "Raj Kumar",
      handle: "rajkumar",
      project: "IFOS2",
      time: "5h",
      text: "Designed dashboard wireframes.",
    },
  ]);

  const filteredPosts =
    activeTab === "All"
      ? posts
      : posts.filter((post) => post.project === activeTab);

  const PROJECT_COLORS = {
    METDB: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Voltraxx: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    IFOS2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

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
                  onClick={() => {
                    if (!newPost.trim()) return;
                    setPosts([
                      {
                        id: Date.now(),
                        author: "Aiman Hazim",
                        handle: "aimanhazim",
                        project: selectedProject,
                        time: new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        text: newPost,
                      },
                      ...posts,
                    ]);
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
            <article
              key={post.id}
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
                    <span className="text-zinc-500 text-sm">{post.time}</span>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${PROJECT_COLORS[post.project]}`}
                    >
                      {post.project}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{post.text}</p>
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
