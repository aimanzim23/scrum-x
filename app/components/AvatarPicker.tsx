"use client";
import { useState } from "react";
import { AVATAR_PALETTE_KEYS, AVATAR_PALETTES } from "../lib/avatar";
import type { AvatarConfig, AvatarPaletteKey } from "../lib/avatar";
import UserAvatar from "./UserAvatar";

const BEAM_SEEDS = [
  "alpha","bravo","charlie","delta","echo","foxtrot",
  "gamma","hotel","india","juliet","kilo","lima",
];

interface AvatarPickerProps {
  handle: string;
  current: AvatarConfig;
  onSave: (config: AvatarConfig) => Promise<void>;
  onClose: () => void;
}

export default function AvatarPicker({ handle, current, onSave, onClose }: AvatarPickerProps) {
  const [draft, setDraft] = useState<AvatarConfig>({ ...current, variant: "beam" });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose();
  }

  return (
    <div className="border border-zinc-800 rounded-2xl bg-zinc-950 p-4 mt-3 space-y-4">

      {/* Style */}
      <div>
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Style</p>
        <div className="grid grid-cols-6 gap-2">
          {BEAM_SEEDS.map((seed) => (
            <button
              key={seed}
              onClick={() => setDraft((d) => ({ ...d, seed }))}
              className={`rounded-full overflow-hidden ring-2 transition-all ${
                (draft.seed ?? handle) === seed
                  ? "ring-sky-500 scale-110"
                  : "ring-transparent hover:ring-zinc-600"
              }`}
            >
              <UserAvatar handle={seed} config={{ ...draft, seed }} size={40} />
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Color</p>
        <div className="flex gap-2">
          {AVATAR_PALETTE_KEYS.map((key) => {
            const colors = AVATAR_PALETTES[key];
            return (
              <button
                key={key}
                onClick={() => setDraft((d) => ({ ...d, palette: key as AvatarPaletteKey }))}
                title={key}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  draft.palette === key ? "border-white scale-110" : "border-transparent hover:border-zinc-500"
                }`}
                style={{ background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[3]} 100%)` }}
              />
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold rounded-full py-2 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onClose}
          className="px-4 border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-sm rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
