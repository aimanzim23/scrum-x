"use client";

import { useState, useEffect } from "react";
import { type Post } from "../../../lib/posts";
import { supabase } from "../../../lib/supabase";
import { getProjectColor } from "../../../lib/projectColor";
import { formatLongDate } from "../../../lib/scrumDate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScrumReport({
  iso,
  project,
}: {
  iso: string;
  project: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Bound the query to a ±1 day window so the exact local-day match below
      // stays cheap while still covering every timezone the viewer might be in.
      const from = new Date(`${iso}T00:00:00`);
      from.setDate(from.getDate() - 1);
      const to = new Date(`${iso}T00:00:00`);
      to.setDate(to.getDate() + 2);

      const [{ data: postsData }, { data: projectsData }] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("project", project)
          .gte("created_at", from.toISOString())
          .lt("created_at", to.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("name")
          .order("created_at", { ascending: true }),
      ]);

      const target = new Date(`${iso}T00:00:00`).toDateString();
      setPosts(
        (postsData ?? []).filter(
          (p) => new Date(p.created_at).toDateString() === target,
        ),
      );
      setProjects(projectsData?.map((p) => p.name) ?? []);
      setLoading(false);
    }
    fetchData();
  }, [iso, project]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <img src="/scrumx-wordmark-light.svg" alt="ScrumX" className="h-7" />
          <Badge
            variant="outline"
            className={getProjectColor(project, projects)}
          >
            {project}
          </Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="border-b border-zinc-800 px-4 py-5">
          <h1 className="text-lg font-bold text-white">Daily scrum report</h1>
          <p className="mt-1 text-sm text-zinc-500">{formatLongDate(iso)}</p>
        </div>

        <main>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-4 border-b border-zinc-800">
                <div className="flex gap-3">
                  <Skeleton className="size-10 rounded-full shrink-0 bg-zinc-800" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <Skeleton className="h-3 w-28 bg-zinc-800" />
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-4/5 bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <p className="py-16 text-center text-zinc-600 text-sm">
              No reports for {project} on this day.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="px-4 py-4 border-b border-zinc-800"
              >
                <div className="flex gap-3">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-zinc-700 text-white font-bold">
                      {post.author
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm truncate max-w-[140px]">
                        {post.handle.charAt(0).toUpperCase() +
                          post.handle.slice(1)}
                      </span>
                      <span className="text-zinc-500 text-sm truncate max-w-[100px]">
                        @{post.handle}
                      </span>
                      <span className="text-zinc-600 text-sm">·</span>
                      <span className="text-zinc-500 text-sm">{post.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap break-words">
                      {post.text}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </main>

        <p className="py-8 text-center text-xs text-zinc-700">
          Shared from ScrumX
        </p>
      </div>
    </div>
  );
}
