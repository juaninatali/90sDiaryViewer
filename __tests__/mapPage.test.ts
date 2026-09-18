import { getStaticProps } from "@/pages/map";
import { getMapData, reportMapDataDiagnostics } from "@/lib/server/mapData";

jest.mock("@/components/Layout", () => ({ Layout: jest.fn() }));
jest.mock("@/components/VenueMap", () => jest.fn());
jest.mock("@/lib/server/mapData", () => ({
  getMapData: jest.fn(),
  reportMapDataDiagnostics: jest.fn(),
}));

test("Map props serialize only grouped Map data", async () => {
  const locations = [{
    address: "Shared 123",
    venues: [
      { name: "First", diaryEntryCount: 2 },
      { name: "Second", diaryEntryCount: 1 },
    ],
  }];
  jest.mocked(getMapData).mockReturnValue({
    locations,
    unmatched: ["Unknown"],
    missingAddresses: ["No address"],
  });
  const result = await getStaticProps({});
  if (!("props" in result)) throw new Error("Expected Map page props");
  const props = await result.props;
  expect(props).toEqual({ locations });
  expect(JSON.stringify(props)).not.toMatch(/entries|tags|date|text|images/);
  expect(reportMapDataDiagnostics).toHaveBeenCalledWith({
    locations,
    unmatched: ["Unknown"],
    missingAddresses: ["No address"],
  });
});
