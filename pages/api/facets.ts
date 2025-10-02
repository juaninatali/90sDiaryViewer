import type { NextApiRequest, NextApiResponse } from "next";
import { getAllEntries } from "@/lib/entries";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const entries = getAllEntries();

  const tagCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();

  for (const e of entries) {
    const y = e.date?.slice(0, 4);
    if (y) yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1);

    for (const t of e.tags ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }

  // Sort tags by frequency desc, then alpha
  const tags = Array.from(tagCounts.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));

  const years = Array.from(yearCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));

  res.status(200).json({ tags, years });
}