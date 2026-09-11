import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type VenueRecord = { name: string; address: string | null };

export function parseVenues(csv: string): { venues: VenueRecord[]; emptyRows: number } {
  const rows: string[][] = parse(csv, { bom: true, skip_empty_lines: true });
  const header = rows.shift();
  if (!header || !header.includes("Venue name") || !header.includes("Address")) {
    throw new Error('CSV must contain the required columns "Venue name" and "Address".');
  }
  if (new Set(header).size !== header.length) throw new Error("CSV contains duplicate column names.");
  const nameIndex = header.indexOf("Venue name");
  const addressIndex = header.indexOf("Address");
  const venues: VenueRecord[] = [];
  let emptyRows = 0;
  rows.forEach((row, index) => {
    if (row.every((value) => value.trim() === "")) {
      emptyRows++;
      return;
    }
    const name = row[nameIndex];
    if (!name.trim()) throw new Error(`CSV record ${index + 2} is missing Venue name.`);
    const address = row[addressIndex];
    venues.push({ name, address: address.trim() === "" ? null : address });
  });
  if (!venues.length) throw new Error("CSV contains no valid venue records; catalogue was not overwritten.");
  return { venues, emptyRows };
}

export function renderVenues(venues: VenueRecord[]): string {
  return `// Initially generated from Venues.csv.
// This venue catalogue may be manually curated after import.
// Running npm run generate-venues again replaces this file.

export type Venue = {
  name: string;
  address: string | null;
};

export const venues: Venue[] = ${JSON.stringify(venues, null, 2)};
`;
}

function generateVenues(): void {
  const input = path.resolve(__dirname, "../source/Venues.csv");
  const output = path.resolve(__dirname, "../data/venues.ts");
  try {
    const { venues, emptyRows } = parseVenues(fs.readFileSync(input, "utf8"));
    // Validate the entire input before touching the manually maintainable output.
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, renderVenues(venues), "utf8");
    console.log(`Generated ${venues.length} venues; ${venues.filter((venue) => venue.address === null).length} null addresses; ${emptyRows} empty CSV records skipped (blank lines ignored).`);
  } catch (error) {
    console.error(`Venue generation failed (${input}): ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (require.main === module) generateVenues();
