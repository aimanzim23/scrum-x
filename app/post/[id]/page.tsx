"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ShareButton from "../../components/ShareButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const COLOR_PALETTE = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
];

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<{
    id: number;
    author: string;
    handle: string;
    phone: string | null;
    text: string;
    project: string;
    time: string;
    created_at: string;
  } | null>(null);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: postData }, { data: projectsData }] = await Promise.all([
        supabase.from("posts").select("*").eq("id", id).single(),
        supabase.from("projects").select("name").order("created_at", { ascending: true }),
      ]);

      if (!postData) { setLoading(false); return; }
      setPost(postData);
      setProjects(projectsData?.map((p) => p.name) ?? []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const projectIdx = post ? projects.indexOf(post.project) : -1;
  const projectColor = COLOR_PALETTE[projectIdx >= 0 ? projectIdx % COLOR_PALETTE.length : 0];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Back
        </Link>

        {loading ? (
          <div className="mt-6 flex gap-3">
            <Skeleton className="size-10 rounded-full shrink-0 bg-zinc-800" />
            <div className="flex-1 space-y-2.5 pt-1">
              <Skeleton className="h-3 w-28 bg-zinc-800" />
              <Skeleton className="h-3 w-full bg-zinc-800" />
              <Skeleton className="h-3 w-4/5 bg-zinc-800" />
              <Skeleton className="h-3 w-2/3 bg-zinc-800" />
            </div>
          </div>
        ) : !post ? (
          <p className="mt-16 text-center text-zinc-500">Post not found.</p>
        ) : (
          <div className="mt-6 flex gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-zinc-700 text-white font-bold">
                {post.author.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{post.author}</p>
                  <p className="text-zinc-500 text-sm">@{post.handle}</p>
                </div>
                <ShareButton
                  phone={post.phone}
                  text={post.text}
                  project={post.project}
                  projects={projects}
                  postId={post.id}
                  handle={post.handle}
                  onDelete={() => router.push("/")}
                  onEdit={(newText, newProject) => setPost({ ...post, text: newText, project: newProject })}
                />
              </div>
              <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">{post.text}</p>
              <Badge variant="outline" className={`mt-4 ${projectColor}`}>
                {post.project}
              </Badge>
              <p className="mt-4 text-xs text-zinc-600">
                {post.time} · {new Date(post.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
