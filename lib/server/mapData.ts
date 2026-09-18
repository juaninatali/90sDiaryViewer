import { venues, type Venue } from "@/data/venues";
import { groupVenuesByAddress, resolveReferencedVenues } from "@/lib/locations";
import { getArchiveEntries } from "@/lib/server/archiveIndex";
import type { DiaryEntry } from "@/types/diary";
import type { MapLocationData } from "@/types/map";

export type MapDataResult = {
  locations: MapLocationData[];
  unmatched: string[];
  missingAddresses: string[];
};

const reportedDiagnostics = new Set<string>();

export function reportMapDataDiagnostics({ unmatched, missingAddresses }: MapDataResult): void {
  for (const name of unmatched) {
    const diagnostic = `unmatched:${name}`;
    if (reportedDiagnostics.has(diagnostic)) continue;
    reportedDiagnostics.add(diagnostic);
    console.warn("Unmatched archive Venue tag:", name);
  }
  for (const name of missingAddresses) {
    const diagnostic = `missing-address:${name}`;
    if (reportedDiagnostics.has(diagnostic)) continue;
    reportedDiagnostics.add(diagnostic);
    console.warn("Archive venue has no usable catalogue address:", name);
  }
}

export function buildMapData(
  entries: readonly DiaryEntry[],
  catalogue: readonly Venue[],
): MapDataResult {
  const resolved = resolveReferencedVenues(entries, catalogue);
  const locations = groupVenuesByAddress(resolved.locations).map(({ address, venues: groupedVenues }) => ({
    address,
    venues: groupedVenues.map(({ name, entries: associatedEntries }) => ({
      name,
      diaryEntryCount: new Set(associatedEntries.map(({ id }) => id)).size,
    })),
  }));

  return {
    locations,
    unmatched: resolved.unmatched,
    missingAddresses: resolved.missingAddresses,
  };
}

export function getMapData(): MapDataResult {
  return buildMapData(getArchiveEntries(), venues);
}
