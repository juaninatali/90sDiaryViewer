import { buildMapData, reportMapDataDiagnostics } from "@/lib/server/mapData";
import type { Venue } from "@/data/venues";
import type { DiaryEntry } from "@/types/diary";

function entry(id: string, date: string, tags: string[]): DiaryEntry {
  return { id, date, tags, title: "Private title", location: "Legacy location", text: "Private text", images: ["/private.jpg"] };
}

test("builds minimal grouped Map data with unique entry counts without mutating archive data", () => {
  const entries = [
    entry("1", "1999-01-01", ["Venue: Later", "Venue: Later", "Artist: Private"]),
    entry("2", "1994-01-01", [" Venue: Earlier ", "Venue: Missing address", "Venue: Unknown"]),
    entry("2", "1994-01-01", ["Venue: Earlier"]),
  ];
  const catalogue: Venue[] = [
    { name: "Earlier", address: "Shared 123" },
    { name: "Later", address: "Shared 123 " },
    { name: "Missing address", address: null },
  ];
  const snapshot = JSON.stringify({ entries, catalogue });

  const result = buildMapData(entries, catalogue);

  expect(result).toEqual({
    locations: [{
      address: "Shared 123",
      venues: [
        { name: "Earlier", diaryEntryCount: 1 },
        { name: "Later", diaryEntryCount: 1 },
      ],
    }],
    unmatched: ["Unknown"],
    missingAddresses: ["Missing address"],
  });
  expect(JSON.stringify({ entries, catalogue })).toBe(snapshot);
  expect(JSON.stringify(result.locations)).not.toMatch(/Private|Legacy|Artist|images|tags|text|date|id/);
});

test("reports each distinct Map data diagnostic only once", () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const result = {
    locations: [],
    unmatched: ["One-off unknown"],
    missingAddresses: ["One-off missing address"],
  };

  reportMapDataDiagnostics(result);
  reportMapDataDiagnostics(result);

  expect(warn).toHaveBeenCalledTimes(2);
  expect(warn).toHaveBeenCalledWith("Unmatched archive Venue tag:", "One-off unknown");
  expect(warn).toHaveBeenCalledWith("Archive venue has no usable catalogue address:", "One-off missing address");
  warn.mockRestore();
});
