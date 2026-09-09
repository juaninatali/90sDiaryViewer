import type { DiaryEntry } from "@/types/diary";

export type ArchiveLocation = {
  address: string;
  entries: DiaryEntry[];
};

export function normalizeGeocodingAddress(address: string): string {
  let normalized = address.trim();
  if (!/\bbuenos\s+aires\b/i.test(normalized)) normalized += ", Buenos Aires";
  if (!/\bargentina\b/i.test(normalized)) normalized += ", Argentina";
  return normalized;
}

export function groupLocations(entries: DiaryEntry[]): ArchiveLocation[] {
  const locations = new Map<string, ArchiveLocation>();
  for (const entry of entries) {
    if (typeof entry.location !== "string") continue;
    const address = entry.location.trim();
    if (!address || !/[\p{L}\p{N}]/u.test(address)) continue;
    if (address.toLowerCase().includes("tbc, buenos aires")) continue;
    if (Array.isArray(entry.tags) && entry.tags.some(
      (tag) => typeof tag === "string" && tag.trim().toLowerCase() === "venue: unknown"
    )) continue;
    const existing = locations.get(address);
    if (existing) existing.entries.push(entry);
    else locations.set(address, { address, entries: [entry] });
  }
  return [...locations.values()];
}
