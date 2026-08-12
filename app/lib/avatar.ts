import { supabase } from "./supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AvatarVariant = "beam" | "marble" | "pixel" | "ring" | "sunset";

export type AvatarPaletteKey =
  | "sky" | "forest" | "sunset" | "purple" | "rose" | "mono";

export interface AvatarConfig {
  variant: AvatarVariant;
  palette: AvatarPaletteKey;
  seed?: string;
  emoji?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const AVATAR_VARIANTS: AvatarVariant[] = ["beam", "marble", "pixel", "ring", "sunset"];

export const AVATAR_PALETTES: Record<AvatarPaletteKey, string[]> = {
  sky:     ["#0ea5e9", "#38bdf8", "#7dd3fc", "#0369a1", "#1e3a5f"],
  forest:  ["#22c55e", "#86efac", "#dcfce7", "#15803d", "#14532d"],
  sunset:  ["#f97316", "#fb923c", "#fed7aa", "#ea580c", "#9a3412"],
  purple:  ["#a855f7", "#d8b4fe", "#f3e8ff", "#7e22ce", "#4a044e"],
  rose:    ["#f43f5e", "#fda4af", "#ffe4e6", "#be123c", "#881337"],
  mono:    ["#71717a", "#a1a1aa", "#d4d4d8", "#3f3f46", "#18181b"],
};

export const AVATAR_PALETTE_KEYS = Object.keys(AVATAR_PALETTES) as AvatarPaletteKey[];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = { variant: "beam", palette: "sky" };

// ── Supabase helpers ──────────────────────────────────────────────────────────

function rowToConfig(row: Record<string, string>): AvatarConfig {
  return {
    variant: (row.avatar_variant as AvatarVariant) ?? "beam",
    palette: (row.avatar_palette as AvatarPaletteKey) ?? "sky",
    seed:    row.avatar_seed ?? undefined,
    emoji:   row.avatar_emoji ?? undefined,
  };
}

export async function getAvatarConfig(handle: string): Promise<AvatarConfig> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_variant, avatar_palette, avatar_seed, avatar_emoji")
    .eq("handle", handle)
    .single();
  return data ? rowToConfig(data) : DEFAULT_AVATAR_CONFIG;
}

export async function getAvatarConfigs(handles: string[]): Promise<Record<string, AvatarConfig>> {
  if (!handles.length) return {};
  const { data } = await supabase
    .from("profiles")
    .select("handle, avatar_variant, avatar_palette, avatar_seed, avatar_emoji")
    .in("handle", handles);
  const map: Record<string, AvatarConfig> = {};
  for (const row of data ?? []) map[row.handle] = rowToConfig(row);
  return map;
}

export async function saveAvatarConfig(handle: string, config: AvatarConfig): Promise<void> {
  await supabase.from("profiles").upsert({
    handle,
    avatar_variant: config.variant,
    avatar_palette: config.palette,
    avatar_seed:    config.seed ?? null,
    avatar_emoji:   config.emoji ?? null,
    updated_at:     new Date().toISOString(),
  });
}
