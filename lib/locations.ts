import type { DiaryEntry } from "@/types/diary";
import type { Venue } from "@/data/venues";

export type ArchiveVenue = {
  name: string;
  address: string;
  entries: DiaryEntry[];
};

export function normalizeGeocodingAddress(address: string): string {
  let normalized = address.trim();
  // Add province/country context only to the query, preserving locality text.
  const hasCountry = /(?:^|,)\s*Argentina\s*$/i.test(normalized);
  if (!/\bBuenos\s+Aires\b/i.test(normalized)) {
    normalized += ", Buenos Aires";
  }
  return hasCountry ? normalized : `${normalized}, Argentina`;
}

export function resolveReferencedVenues(entries: DiaryEntry[], catalogue: Venue[]) {
  const referenced = new Map<string, DiaryEntry[]>();
  for (const entry of entries) {
    const names = new Set<string>();
    for (const tag of Array.isArray(entry.tags) ? entry.tags : []) {
      if (typeof tag !== "string") continue;
      const match = /^\s*Venue\s*:\s*(.*?)\s*$/i.exec(tag);
      if (match?.[1]) names.add(match[1]);
    }
    for (const name of names) {
      const associated = referenced.get(name);
      if (associated) associated.push(entry);
      else referenced.set(name, [entry]);
    }
  }
  const byName = new Map(catalogue.map((venue) => [venue.name.trim(), venue]));
  const locations: ArchiveVenue[] = [];
  const unmatched: string[] = [];
  const missingAddresses: string[] = [];
  for (const [name, associated] of referenced) {
    const venue = byName.get(name);
    if (!venue) {
      unmatched.push(name);
      continue;
    }
    if (typeof venue.address !== "string" || !/[\p{L}\p{N}]/u.test(venue.address)
      || /^\s*(?:TBC|Unknown)(?:\s*,.*)?\s*$/i.test(venue.address)) {
      missingAddresses.push(venue.name);
      continue;
    }
    locations.push({ name: venue.name, address: venue.address, entries: associated });
  }
  // Oldest referenced venues receive the highest marker stacking priority.
  // Missing/invalid dates sort last; ties retain their original order.
  const orderedLocations = locations.map((location) => ({
    location,
    earliest: location.entries.reduce((earliest, entry) => {
      const date = Date.parse(entry.date);
      return Number.isFinite(date) ? Math.min(earliest, date) : earliest;
    }, Infinity),
  })).sort((a, b) => a.earliest - b.earliest).map(({ location }) => location);
  return { locations: orderedLocations, unmatched, missingAddresses, referencedCount: referenced.size };
}
