import Link from "next/link";
import { supabase } from "../../lib/supabase";
import ShareButton from "../../components/ShareButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          ← Back
        </Link>
        <div className="mt-6 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
            {post.author
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{post.author}</p>
                <p className="text-zinc-500 text-sm">@{post.handle}</p>
              </div>
              <ShareButton phone={post.phone} text={post.text} postId={post.id} handle={post.handle} />
            </div>
            <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">
              {post.text}
            </p>
            <span className="mt-4 inline-block text-xs px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
              {post.project}
            </span>
            <p className="mt-4 text-xs text-zinc-600">
              {post.time} · {new Date(post.created_at).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
