const COLOR_PALETTE = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
];

export function getProjectColor(name: string, projects: string[]): string {
  const idx = projects.indexOf(name);
  return COLOR_PALETTE[idx >= 0 ? idx % COLOR_PALETTE.length : 0];
}
