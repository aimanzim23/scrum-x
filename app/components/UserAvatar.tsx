"use client";
import BoringAvatar from "boring-avatars";
import { AVATAR_PALETTES } from "../lib/avatar";
import type { AvatarConfig } from "../lib/avatar";

interface UserAvatarProps {
  handle: string;
  config: AvatarConfig;
  size?: number;
}

export default function UserAvatar({ handle, config, size = 40 }: UserAvatarProps) {
  const colors = AVATAR_PALETTES[config.palette] ?? AVATAR_PALETTES.sky;
  const seed = config.seed ?? handle;
  return (
    <div className="relative rounded-full overflow-hidden shrink-0" style={{ width: size, height: size }}>
      <BoringAvatar size={size} name={seed} variant={config.variant} colors={colors} />
      {config.emoji && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: size * 0.42 }}
        >
          {config.emoji}
        </div>
      )}
    </div>
  );
}
