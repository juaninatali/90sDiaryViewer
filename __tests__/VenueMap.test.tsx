/** @jest-environment jsdom */
import { act, render, screen, waitFor } from "@testing-library/react";
import VenueMap from "@/components/VenueMap";
import type { DiaryEntry } from "@/types/diary";

test("shows missing configuration without requesting Google Maps", () => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  try {
    const view = render(<VenueMap entries={[]} />);
    expect(screen.getByRole("alert").textContent).toContain("configuration is missing");
    expect(document.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
    view.unmount();
  } finally {
    if (key !== undefined) process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = key;
  }
});

test("continues after a failed address, fits successful markers, and cleans up", async () => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
  process.env.NEXT_PUBLIC_GOOGLE_MAP_ID = "test-map";
  const position = { lat: () => -34.6, lng: () => -58.38 };
  const geocode = jest.fn()
    .mockRejectedValueOnce(new Error("ZERO_RESULTS"))
    .mockResolvedValue({ results: [{ geometry: { location: position } }] });
  const fitBounds = jest.fn();
  const extend = jest.fn();
  const marker = { map: {} as unknown };
  const AdvancedMarkerElement = jest.fn().mockImplementation(() => marker);
  const importLibrary = jest.fn(async (name: string) => ({
    maps: { Map: jest.fn().mockImplementation(() => ({ fitBounds })) },
    marker: { AdvancedMarkerElement },
    geocoding: { Geocoder: jest.fn().mockImplementation(() => ({ geocode })) },
  }[name]));
  Object.defineProperty(window, "google", { configurable: true, value: {
    maps: { importLibrary, LatLngBounds: jest.fn().mockImplementation(() => ({ extend })) },
  } });
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const entries = [" Unknown 123 ", "Corrientes 319", " Corrientes 319 "].map((location, index): DiaryEntry => ({
    id: String(index), title: "", date: "", location, text: "", tags: [], images: [],
  }));
  const view = render(<VenueMap entries={entries} />);
  try {
    await act(async () => {
      (window as Window & { initArchiveMap?: () => void }).initArchiveMap!();
    });
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("1 of 2 archive locations shown"));
    expect(geocode).toHaveBeenCalledTimes(2);
    expect(geocode).toHaveBeenLastCalledWith({ address: "Corrientes 319, Buenos Aires, Argentina" });
    expect(warn).toHaveBeenCalledWith("Could not geocode archive location:", " Unknown 123 ");
    expect(AdvancedMarkerElement).toHaveBeenCalledTimes(1);
    expect(extend).toHaveBeenCalledWith(position);
    expect(fitBounds).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(marker.map).toBeNull();
  } finally {
    view.unmount();
    warn.mockRestore();
    if (key === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    else process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = key;
    if (mapId === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
    else process.env.NEXT_PUBLIC_GOOGLE_MAP_ID = mapId;
    Reflect.deleteProperty(window, "google");
  }
});
