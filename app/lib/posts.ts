import { supabase } from "./supabase";

export interface Post {
  id: number;
  author: string;
  handle: string;
  project: string;
  time: string;
  text: string;
  phone: string | null;
  is_draft: boolean;
  created_at: string;
}

export const defaultPosts: Post[] = [];

export const PAGE_SIZE = 10;

export async function getPublishedPostsByHandle(
  handle: string,
  offset = 0,
): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("handle", handle)
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  return data ?? [];
}

export async function getDraftsByHandle(handle: string): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("handle", handle)
    .eq("is_draft", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Profile stats ────────────────────────────────────────────────────────────

export async function getProfileStats(
  handle: string,
): Promise<{ totalPosts: number; projects: string[] }> {
  const { data } = await supabase
    .from("posts")
    .select("project")
    .eq("handle", handle)
    .eq("is_draft", false);
  const rows = data ?? [];
  return {
    totalPosts: rows.length,
    projects: Array.from(new Set(rows.map((r) => r.project))),
  };
}
