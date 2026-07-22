// Share URLs use DD-MM-YYYY (/scrums/22-07-2026/IFOS2); state uses YYYY-MM-DD.

export function toSlugDate(iso: string): string {
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

export function fromSlugDate(slug: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(slug);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  // Date rolls impossible days over (31-02-2026 becomes 3 March), so compare
  // the parsed components back against the input instead of trusting NaN.
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() + 1 !== Number(mm) ||
    d.getDate() !== Number(dd)
  ) {
    return null;
  }
  return iso;
}

export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
