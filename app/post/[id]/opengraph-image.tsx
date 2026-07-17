import { ImageResponse } from "next/og";
import { supabase } from "../../lib/supabase";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
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
    return new ImageResponse(
      <div style={{ background: "#000", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#52525b", fontSize: 32 }}>Post not found</span>
      </div>,
      size,
    );
  }

  const initials = post.author.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const handle = post.handle.charAt(0).toUpperCase() + post.handle.slice(1);
  const truncatedText = post.text.length > 300 ? post.text.slice(0, 297) + "…" : post.text;

  return new ImageResponse(
    <div
      style={{
        background: "#09090b",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#3f3f46",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {initials}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>{handle}</span>
          <span style={{ color: "#71717a", fontSize: 18 }}>@{post.handle}</span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            border: "1px solid #3f3f46",
            borderRadius: "9999px",
            padding: "6px 16px",
            color: "#a1a1aa",
            fontSize: 16,
          }}
        >
          {post.project}
        </div>
      </div>

      {/* Post text */}
      <div
        style={{
          color: "#d4d4d8",
          fontSize: 28,
          lineHeight: 1.6,
          flex: 1,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {truncatedText}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid #27272a", paddingTop: "24px" }}>
        <span style={{ color: "#52525b", fontSize: 18 }}>scrum-x</span>
        <span style={{ color: "#52525b", fontSize: 18 }}>{post.time} · {new Date(post.created_at).toLocaleDateString("en-GB")}</span>
      </div>
    </div>,
    size,
  );
}
