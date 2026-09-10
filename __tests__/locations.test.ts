import { resolveReferencedVenues, normalizeGeocodingAddress } from "@/lib/locations";
import type { DiaryEntry } from "@/types/diary";
import type { Venue } from "@/data/venues";

const entry = (tags: string[], id = "1"): DiaryEntry => ({
  id, tags, location: "TBC, Buenos Aires", title: "", date: "", text: "", images: [],
});

test("resolves multiple venues, deduplicates tags, and preserves entries and catalogue data", () => {
  const first = entry(["Venue: Ave Porco", "Venue: Morocco", "Venue: El Dorado", "Venue: Ave Porco", "Artist: Other", "Genre: Techno"]);
  const second = entry([" Venue: Ave Porco ", "Venue: Unknown"], "2");
  const catalogue: Venue[] = [
    { name: " Ave Porco ", address: "Catalogue 123" },
    { name: "Morocco", address: "Shared 456" },
    { name: "El Dorado", address: "Shared 456" },
    { name: "Unreferenced", address: "Elsewhere" },
  ];
  const original = JSON.stringify({ first, second, catalogue });
  const result = resolveReferencedVenues([first, second], catalogue);
  expect(result.locations).toEqual([
    { ...catalogue[0], entries: [first, second] },
    { ...catalogue[1], entries: [first] },
    { ...catalogue[2], entries: [first] },
  ]);
  expect(result.unmatched).toEqual(["Unknown"]);
  expect(result.referencedCount).toBe(4);
  expect(JSON.stringify({ first, second, catalogue })).toBe(original);
});

test("prioritizes earliest diary references at shared addresses regardless of input order", () => {
  const catalogue: Venue[] = [
    { name: "Lisboa", address: "Bartolomé Mitre 1851" },
    { name: "Fellini", address: "Bartolomé Mitre 1851" },
    { name: "Nuevo Requiem", address: "Av. De Mayo 948" },
    { name: "El Pantheon", address: "Av. De Mayo 948" },
    { name: "Undated", address: "Bartolomé Mitre 1851" },
  ];
  const dated = (name: string, date: string) => ({ ...entry([`Venue: ${name}`]), date });
  const entries = [
    dated("Undated", "invalid"), dated("Nuevo Requiem", "2000-12-16"),
    dated("Fellini", "1999-01-01"), dated("Lisboa", "1995-07-22"),
    dated("El Pantheon", "1996-05-04"), dated("Fellini", "1994-07-17"),
  ];
  const snapshot = JSON.stringify(entries);
  const result = resolveReferencedVenues(entries, catalogue);
  expect(result.locations.map(({ name }) => name)).toEqual([
    "Fellini", "Lisboa", "El Pantheon", "Nuevo Requiem", "Undated",
  ]);
  expect(result.locations[0].entries).toHaveLength(2);
  expect(JSON.stringify(entries)).toBe(snapshot);
});

test("skips unusable addresses and never fuzzy-matches or falls back to diary locations", () => {
  const catalogue: Venue[] = [
    { name: "Null", address: null }, { name: "Blank", address: "  " },
    { name: "TBC", address: "TBC, Buenos Aires" }, { name: "Punctuation", address: "-" },
    { name: "El Sótano", address: "Valid 123" },
  ];
  const result = resolveReferencedVenues([entry([
    "Venue: Null", "Venue: Blank", "Venue: TBC", "Venue: Punctuation", "Venue: El Sotano", "Venue: el Sótano",
    "Venue: ", "Artist: Null",
  ])], catalogue);
  expect(result.locations).toEqual([]);
  expect(result.missingAddresses).toEqual(["Null", "Blank", "TBC", "Punctuation"]);
  expect(result.unmatched).toEqual(["El Sotano", "el Sótano"]);
});

test.each([
  ["Av. Corrientes 319", "Av. Corrientes 319, Buenos Aires, Argentina"],
  ["Av. Corrientes 319, Buenos Aires", "Av. Corrientes 319, Buenos Aires, Argentina"],
  ["Av. Corrientes 319, Buenos Aires, Argentina", "Av. Corrientes 319, Buenos Aires, Argentina"],
  [" Av. Corrientes 319, ARGENTINA ", "Av. Corrientes 319, ARGENTINA, Buenos Aires"],
  ["Av. De Mayo 432 (Ramos Mejía)", "Av. De Mayo 432 (Ramos Mejía), Buenos Aires, Argentina"],
  ["Moreno", "Moreno, Buenos Aires, Argentina"],
  ["Av. Carlos Casares 381 (Rafael Castillo)", "Av. Carlos Casares 381 (Rafael Castillo), Buenos Aires, Argentina"],
  ["Calle 883 y Av. 844 (Solano)", "Calle 883 y Av. 844 (Solano), Buenos Aires, Argentina"],
  ["Moreno, BUENOS AIRES, argentina", "Moreno, BUENOS AIRES, argentina"],
  ["Av. Antártida Argentina 1160", "Av. Antártida Argentina 1160, Buenos Aires, Argentina"],
])("includes province and country context without changing locality: %s", (input, expected) => {
  expect(normalizeGeocodingAddress(input)).toBe(expected);
});
