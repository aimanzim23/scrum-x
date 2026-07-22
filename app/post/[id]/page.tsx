"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ShareButton from "../../components/ShareButton";
import { getProjectColor } from "../../lib/projectColor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

  const projectColor = post ? getProjectColor(post.project, projects) : "";

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
