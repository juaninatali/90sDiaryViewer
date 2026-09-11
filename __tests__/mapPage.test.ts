import { getStaticProps } from "@/pages/map";
import { getAllEntries } from "@/lib/entries";
import { groupVenuesByAddress, resolveReferencedVenues } from "@/lib/locations";
import { venues } from "@/data/venues";

jest.mock("@/components/Layout", () => ({ Layout: jest.fn() }));
jest.mock("@/components/VenueMap", () => jest.fn());

test("Map props serialize only metadata and preserve venue grouping and entry associations", async () => {
  const fullEntries = getAllEntries();
  const result = await getStaticProps({});
  if (!("props" in result)) throw new Error("Expected Map page props");
  const props = await result.props;
  expect(Object.keys(props)).toEqual(["entries"]);
  expect(props.entries.length).toBeGreaterThan(0);
  expect(props.entries).toHaveLength(fullEntries.length);
  props.entries.forEach((entry, index) => {
    expect(Object.keys(entry).sort()).toEqual(["date", "id", "tags"]);
    expect(entry).toEqual({ id: fullEntries[index].id, date: fullEntries[index].date, tags: fullEntries[index].tags });
  });
  const full = resolveReferencedVenues(fullEntries, venues);
  const lean = resolveReferencedVenues(props.entries, venues);
  expect(lean.unmatched).toEqual(full.unmatched);
  expect(lean.missingAddresses).toEqual(full.missingAddresses);
  expect(groupVenuesByAddress(lean.locations)).toEqual(
    groupVenuesByAddress(full.locations).map((group) => ({
      ...group,
      venues: group.venues.map((venue) => ({
        ...venue,
        entries: venue.entries.map(({ id, date, tags }) => ({ id, date, tags })),
      })),
    }))
  );
});
