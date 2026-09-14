import { normalizeGeocodingAddress } from "./locations";

// Interim development cache. Reconsider sharing and guaranteed deletion before
// public deployment; localStorage cannot expire itself while the browser is closed.
// Google Geocoding terms allow 30 days; use a conservative 29-day reuse limit.
export const GEOCODING_CACHE_TTL_MS = 29 * 24 * 60 * 60 * 1000;
export const GEOCODING_CACHE_PREFIX = "diary:geocoding:v1:";
export const GEOCODING_BOUNDS = { south: -35.1, west: -59.2, north: -34.1, east: -57.7 };

type Coordinates = { lat: number; lng: number };
export type GeocodingRecord = Coordinates & { cachedAt: number };

export function isFreshGeocodingRecord(value: unknown, now = Date.now()): value is GeocodingRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<GeocodingRecord>;
  return typeof record.lat === "number" && Number.isFinite(record.lat) && Math.abs(record.lat) <= 90
    && typeof record.lng === "number" && Number.isFinite(record.lng) && Math.abs(record.lng) <= 180
    && typeof record.cachedAt === "number" && Number.isFinite(record.cachedAt)
    && record.cachedAt >= 0 && record.cachedAt <= now && now - record.cachedAt < GEOCODING_CACHE_TTL_MS;
}

export function geocodingCacheKey(address: string): string {
  return GEOCODING_CACHE_PREFIX + JSON.stringify([normalizeGeocodingAddress(address), GEOCODING_BOUNDS]);
}

function browserStorage(): Storage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; }
  catch { return undefined; }
}

// One lookup instance per map initialization: even failed requests are attempted
// only once per effective query. Persistence across reloads comes from localStorage.
export function createGeocodingLookup(
  addresses: string[],
  geocode: (query: string) => Promise<Coordinates>,
  storage: Storage | undefined = browserStorage(),
) {
  const activeKeys = new Set(addresses.map(geocodingCacheKey));
  const requests = new Map<string, { cachedAt: number; promise: Promise<Coordinates> }>();
  let warned = false;
  function storageWarning() {
    if (!warned) console.warn("Browser geocoding cache is unavailable; coordinates will be geocoded again on reload.");
    warned = true;
  }
  function read(key: string): GeocodingRecord | undefined {
    if (!storage) return;
    try {
      const raw = storage.getItem(key);
      if (raw === null) return;
      let record: unknown;
      try { record = JSON.parse(raw); } catch { /* Delete malformed JSON below. */ }
      if (isFreshGeocodingRecord(record)) return record;
      storage.removeItem(key);
    } catch { storageWarning(); }
  }
  function prune() {
    for (const [key, request] of requests) {
      if (Date.now() - request.cachedAt >= GEOCODING_CACHE_TTL_MS || request.cachedAt > Date.now()) requests.delete(key);
    }
    if (!storage) return;
    try {
      const keys = Array.from({ length: storage.length }, (_, index) => storage!.key(index));
      for (const key of keys) {
        if (!key?.startsWith(GEOCODING_CACHE_PREFIX)) continue;
        if (!activeKeys.has(key)) storage.removeItem(key);
        else read(key);
      }
    } catch { storageWarning(); }
  }
  if (!storage) storageWarning();
  prune();

  async function lookup(address: string): Promise<Coordinates> {
    const key = geocodingCacheKey(address);
    const cached = read(key);
    if (cached) return { lat: cached.lat, lng: cached.lng };
    let request = requests.get(key);
    if (request && (Date.now() - request.cachedAt >= GEOCODING_CACHE_TTL_MS || request.cachedAt > Date.now())) request = undefined;
    if (!request) {
      const cachedAt = Date.now();
      const promise = (async () => {
        const position = await geocode(normalizeGeocodingAddress(address));
        const record = { lat: position.lat, lng: position.lng, cachedAt };
        if (!isFreshGeocodingRecord(record)) throw new Error("Invalid geocoding coordinates");
        try { storage?.setItem(key, JSON.stringify(record)); } catch { storageWarning(); }
        return { lat: record.lat, lng: record.lng };
      })();
      request = { cachedAt, promise };
      requests.set(key, request);
    }
    return request.promise;
  }
  return { lookup, prune };
}
