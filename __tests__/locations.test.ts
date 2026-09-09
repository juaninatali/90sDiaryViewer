import { groupLocations, normalizeGeocodingAddress } from "@/lib/locations";
import type { DiaryEntry } from "@/types/diary";

describe("geocoding addresses", () => {
  test("excludes unknown venues before grouping without removing eligible entries at the same address", () => {
    const entry = (id: string, location: string, tags: string[] = []): DiaryEntry => ({
      id, location, tags, title: "", date: "", text: "", images: [],
    });
    const eligible = entry("1", "Corrientes 319", ["Venue: Known"]);
    const entries = [
      entry("2", "TBC, Buenos Aires"),
      entry("3", " tbc, buenos aires, Argentina "),
      entry("4", "Florida 100", ["Music", "Venue: Unknown"]),
      entry("5", "Corrientes 319", [" venue: unknown "]),
      eligible,
    ];
    const original = JSON.stringify(entries);
    expect(groupLocations(entries)).toEqual([
      { address: "Corrientes 319", entries: [eligible] },
    ]);
    expect(JSON.stringify(entries)).toBe(original);
  });

  test.each([
    ["Av. Corrientes 319", "Av. Corrientes 319, Buenos Aires, Argentina"],
    ["Av. Corrientes 319, Buenos Aires", "Av. Corrientes 319, Buenos Aires, Argentina"],
    ["Av. Corrientes 319, Buenos Aires, Argentina", "Av. Corrientes 319, Buenos Aires, Argentina"],
    [" Av. Corrientes 319, BUENOS AIRES, argentina ", "Av. Corrientes 319, BUENOS AIRES, argentina"],
    ["Av. Corrientes 319, Argentina", "Av. Corrientes 319, Argentina, Buenos Aires"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeGeocodingAddress(input)).toBe(expected);
  });

  test("groups trimmed addresses, retains entries, and ignores malformed locations", () => {
    const entry = (location: unknown, id: string): DiaryEntry => ({
      id, location: location as string, title: "", date: "", tags: [], text: "", images: [],
    });
    const first = entry(" Av. Corrientes 319 ", "1");
    const second = entry("Av. Corrientes 319", "2");
    const third = entry("Florida 100", "3");
    const result = groupLocations([first, second, third,
      ...[null, undefined, 123, {}, "", "   ", ", -"].map((value) => entry(value, "invalid")),
    ]);
    expect(result).toEqual([
      { address: "Av. Corrientes 319", entries: [first, second] },
      { address: "Florida 100", entries: [third] },
    ]);
    expect(result[0].entries[0]).toBe(first);
    expect(first.location).toBe(" Av. Corrientes 319 ");
  });
});
