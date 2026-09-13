/** @jest-environment jsdom */
import { act, render, screen, waitFor } from "@testing-library/react";
import VenueMap from "@/components/VenueMap";
import type { MapEntry } from "@/types/map";

jest.mock("@/data/venues", () => ({ venues: [
  { name: "Aion", address: "Hipólito Yrigoyen 1115" },
  { name: "Goethe Institut", address: "Av. Corrientes 319" },
  { name: "Later venue", address: "Av. Corrientes 319" },
  { name: "El Santo", address: null },
  { name: "<b>Archive venue</b>", address: "<img src=x onerror=alert(1)> & archival address" },
] }));

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
  const clickHandlers: Array<() => void> = [];
  const removeListener = jest.fn();
  const createdMarkers: Array<{ map: unknown; addListener: jest.Mock }> = [];
  const AdvancedMarkerElement = jest.fn().mockImplementation(() => {
    const marker = { map: {} as unknown, addListener: jest.fn((event, callback) => {
      expect(event).toBe("click");
      clickHandlers.push(callback);
      return { remove: removeListener };
    }) };
    createdMarkers.push(marker);
    return marker;
  });
  const popup = { setContent: jest.fn(), open: jest.fn(), close: jest.fn() };
  const InfoWindow = jest.fn().mockImplementation(() => popup);
  const MapConstructor = jest.fn().mockImplementation(() => ({ fitBounds }));
  const importLibrary = jest.fn(async (name: string) => ({
    maps: { Map: MapConstructor, InfoWindow },
    core: { ColorScheme: { DARK: "DARK" } },
    marker: { AdvancedMarkerElement },
    geocoding: { Geocoder: jest.fn().mockImplementation(() => ({ geocode })) },
  }[name]));
  Object.defineProperty(window, "google", { configurable: true, value: {
    maps: { importLibrary, LatLngBounds: jest.fn().mockImplementation(() => ({ extend })) },
  } });
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const entries = [["Venue: Aion", "Venue: Goethe Institut", "Venue: Goethe Institut", "Venue: El Santo", "Venue: Unmatched", "Artist: Other"], ["Venue: Goethe Institut", "Venue: Later venue", "Venue: <b>Archive venue</b>"]].map((tags, index): MapEntry => ({
    id: String(index), date: "", tags,
  }));
  entries.push({ ...entries[1] }); // Repeated records must not inflate counts.
  const view = render(<VenueMap entries={entries} />);
  try {
    await act(async () => {
      (window as Window & { initArchiveMap?: () => void }).initArchiveMap!();
    });
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("2 of 3 archive locations shown"));
    expect(geocode).toHaveBeenCalledTimes(3);
    expect(MapConstructor).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({
      colorScheme: "DARK", mapId: "test-map",
    }));
    expect(geocode).toHaveBeenNthCalledWith(2, {
      address: "Av. Corrientes 319, Buenos Aires, Argentina",
      bounds: { south: -35.1, west: -59.2, north: -34.1, east: -57.7 },
    });
    expect(warn).toHaveBeenCalledWith("Could not geocode archive venue:", "Aion", "Hipólito Yrigoyen 1115");
    expect(warn).toHaveBeenCalledWith("Unmatched archive Venue tag:", "Unmatched");
    expect(warn).toHaveBeenCalledWith("Archive venue has no usable catalogue address:", "El Santo");
    expect(AdvancedMarkerElement).toHaveBeenCalledTimes(2);
    expect(AdvancedMarkerElement).toHaveBeenCalledWith(expect.objectContaining({ title: "Goethe Institut / Later venue", zIndex: 2 }));
    expect(InfoWindow).toHaveBeenCalledTimes(1);
    expect(InfoWindow).toHaveBeenCalledWith({ headerDisabled: true });
    expect(popup.open).not.toHaveBeenCalled();
    clickHandlers[0]();
    const firstContent: HTMLElement = popup.setContent.mock.calls[0][0];
    expect(Array.from(firstContent.querySelectorAll("h2"), (node) => node.textContent)).toEqual(["Goethe Institut", "Later venue"]);
    expect(firstContent.firstElementChild?.lastElementChild?.textContent).toBe("Av. Corrientes 319");
    expect(firstContent.firstElementChild?.firstElementChild?.tagName).toBe("SECTION");
    expect(firstContent.textContent?.split("Av. Corrientes 319")).toHaveLength(2);
    const sections = firstContent.querySelectorAll("section");
    expect(sections[0].querySelector("p")?.textContent).toBe("2 diary entries · View entries");
    expect(sections[1].querySelector("p")?.textContent).toBe("1 diary entry · View entries");
    for (const [index, name] of ["Goethe Institut", "Later venue"].entries()) {
      const link = sections[index].querySelector("a")!;
      expect(link.textContent).toBe("View entries");
      expect(link.getAttribute("href")).toBe(`/search?tag=${encodeURIComponent(`Venue: ${name}`)}`);
      expect(new URL(link.href).searchParams.get("tag")).toBe(`Venue: ${name}`);
      expect(link.target).toBe("");
    }
    expect(popup.open).toHaveBeenLastCalledWith({ map: expect.anything(), anchor: createdMarkers[0] });
    clickHandlers[1]();
    const nextContent: HTMLElement = popup.setContent.mock.calls[1][0];
    expect(nextContent.querySelector("h2")?.textContent).toBe("<b>Archive venue</b>");
    expect(nextContent.firstElementChild?.lastElementChild?.textContent).toBe("<img src=x onerror=alert(1)> & archival address");
    expect(nextContent.querySelector("img, b")).toBeNull();
    expect(nextContent.querySelector("section p")?.textContent).toBe("1 diary entry · View entries");
    expect(new URL(nextContent.querySelector("a")!.href).searchParams.get("tag")).toBe("Venue: <b>Archive venue</b>");
    expect(AdvancedMarkerElement).toHaveBeenCalledWith(expect.objectContaining({ title: "<b>Archive venue</b>" }));
    expect(popup.open).toHaveBeenLastCalledWith({ map: expect.anything(), anchor: createdMarkers[1] });
    expect(InfoWindow).toHaveBeenCalledTimes(1);
    expect(extend).toHaveBeenCalledWith(position);
    expect(fitBounds).toHaveBeenCalledTimes(1);
    const closeButton = nextContent.querySelector("button")!;
    expect(closeButton.getAttribute("aria-label")).toBe("Close venue information");
    closeButton.click();
    expect(popup.close).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(createdMarkers.every((marker) => marker.map === null)).toBe(true);
    expect(popup.close).toHaveBeenCalledTimes(2);
    expect(removeListener).toHaveBeenCalledTimes(2);
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
