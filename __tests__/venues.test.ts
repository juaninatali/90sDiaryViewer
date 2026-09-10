import { parseVenues, renderVenues } from "../scripts/generateVenues";

describe("venue catalogue import", () => {
  test("preserves source text and ordering, converts blank addresses, and ignores empty records", () => {
    const result = parseVenues('\uFEFFVenue name,Address\r\n" Áion ","Hipólito Yrigoyen 1115 (ex-local), Bs. As."\r\nEl Santo,\r\nTBC,TBC\r\nBlank,   \r\n,\r\n\r\n');
    expect(result).toEqual({ venues: [
      { name: " Áion ", address: "Hipólito Yrigoyen 1115 (ex-local), Bs. As." },
      { name: "El Santo", address: null },
      { name: "TBC", address: "TBC" },
      { name: "Blank", address: null },
    ], emptyRows: 1 });
    const rendered = renderVenues(result.venues);
    expect(rendered).toContain("This venue catalogue may be manually curated after import.");
    expect(rendered).toBe(renderVenues(result.venues));
  });

  test.each([
    ["Aion,Address\n", "required columns"],
    ["Venue name,Address\n,Somewhere\n", "missing Venue name"],
    ["Venue name,Address\n", "no valid venue records"],
    ["Venue name,Address,Address\n", "duplicate column"],
  ])("rejects invalid input without producing a catalogue", (csv, message) => {
    expect(() => parseVenues(csv)).toThrow(message);
  });

  test("rejects malformed CSV", () => {
    expect(() => parseVenues('Venue name,Address\n"Unclosed,Address')).toThrow();
    expect(() => parseVenues("Venue name,Address\nName,Address,Extra")).toThrow();
  });
});
