/** @jest-environment jsdom */
import { createGeocodingLookup, geocodingCacheKey, GEOCODING_CACHE_TTL_MS, isFreshGeocodingRecord } from "@/lib/geocodingCache";

const position = { lat: -34.6, lng: -58.38 };
beforeEach(() => localStorage.clear());
afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test("100 uncached queries persist minimal records; a new lookup performs zero requests", async () => {
  const addresses = Array.from({ length: 100 }, (_, index) => `Av. Corrientes ${index + 1}`);
  const geocode = jest.fn().mockResolvedValue({ ...position, formatted_address: "Do not store" });
  const first = createGeocodingLookup(addresses, geocode);
  for (const address of addresses) await first.lookup(address);
  expect(geocode).toHaveBeenCalledTimes(100);
  expect(localStorage.length).toBe(100);
  const record = JSON.parse(localStorage.getItem(geocodingCacheKey(addresses[0]))!);
  expect(record).toEqual({ ...position, cachedAt: expect.any(Number) });
  geocode.mockClear();
  const second = createGeocodingLookup(addresses, geocode);
  for (const address of addresses) expect(await second.lookup(address)).toEqual(position);
  expect(geocode).not.toHaveBeenCalled();
});

test("expiry at exactly 29 days deletes the record and refreshes without resetting fresh timestamps", async () => {
  const now = 1800000000000;
  const clock = jest.spyOn(Date, "now").mockReturnValue(now);
  const geocode = jest.fn().mockResolvedValue(position);
  const lookup = createGeocodingLookup(["Moreno"], geocode);
  await lookup.lookup("Moreno");
  clock.mockReturnValue(now + GEOCODING_CACHE_TTL_MS - 1);
  await lookup.lookup("Moreno");
  expect(geocode).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem(geocodingCacheKey("Moreno"))!).cachedAt).toBe(now);
  clock.mockReturnValue(now + GEOCODING_CACHE_TTL_MS);
  lookup.prune();
  expect(localStorage.getItem(geocodingCacheKey("Moreno"))).toBeNull();
  await lookup.lookup("Moreno");
  expect(geocode).toHaveBeenCalledTimes(2);
  expect(JSON.parse(localStorage.getItem(geocodingCacheKey("Moreno"))!).cachedAt).toBe(Date.now());
});

test("address changes miss, equivalent normalized queries hit, and unrelated storage is preserved", async () => {
  const geocode = jest.fn().mockResolvedValue(position);
  localStorage.setItem("theme", "dark");
  await createGeocodingLookup(["Moreno"], geocode).lookup("Moreno");
  await createGeocodingLookup([" Moreno, Buenos Aires, Argentina "], geocode).lookup("Moreno, Buenos Aires, Argentina");
  expect(geocode).toHaveBeenCalledTimes(1);
  await createGeocodingLookup(["Solano"], geocode).lookup("Solano");
  expect(geocode).toHaveBeenCalledTimes(2);
  expect(localStorage.getItem(geocodingCacheKey("Moreno"))).toBeNull();
  expect(localStorage.getItem("theme")).toBe("dark");
});

test.each(["{bad", "null", JSON.stringify({ lat: 200, lng: 0, cachedAt: Date.now() }), JSON.stringify({ ...position, cachedAt: Date.now() + 86400000 })])("invalid storage is pruned: %s", async (raw) => {
  localStorage.setItem(geocodingCacheKey("Moreno"), raw);
  const geocode = jest.fn().mockResolvedValue(position);
  const cache = createGeocodingLookup(["Moreno"], geocode);
  expect(localStorage.length).toBe(0);
  await cache.lookup("Moreno");
  expect(geocode).toHaveBeenCalledTimes(1);
});

test("failed queries are tried once per initialization and never persisted", async () => {
  const geocode = jest.fn().mockRejectedValue(new Error("ZERO_RESULTS"));
  const cache = createGeocodingLookup(["Moreno"], geocode);
  await expect(cache.lookup("Moreno")).rejects.toThrow("ZERO_RESULTS");
  await expect(cache.lookup("Moreno")).rejects.toThrow("ZERO_RESULTS");
  expect(geocode).toHaveBeenCalledTimes(1);
  expect(localStorage.length).toBe(0);
});

test("invalid live coordinates are not cached", async () => {
  const cache = createGeocodingLookup(["Moreno"], jest.fn().mockResolvedValue({ lat: NaN, lng: 0 }));
  await expect(cache.lookup("Moreno")).rejects.toThrow("Invalid geocoding coordinates");
  expect(localStorage.length).toBe(0);
});

test("blocked reads and quota failures do not prevent live coordinates rendering", async () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  const cache = createGeocodingLookup(["Moreno"], jest.fn().mockResolvedValue(position));
  expect(await cache.lookup("Moreno")).toEqual(position);
  expect(warn).toHaveBeenCalledTimes(1);
});

test("rejects non-finite coordinates and timestamps", () => {
  expect(isFreshGeocodingRecord({ ...position, cachedAt: NaN })).toBe(false);
  expect(isFreshGeocodingRecord({ lat: 0, lng: Infinity, cachedAt: Date.now() })).toBe(false);
});
