# Interim browser geocoding cache

Phase 2E currently optimizes local development only. It is not the final public
deployment architecture. Every new browser, device, or origin still geocodes its
own addresses. No shared service, new credentials, refresh script, or build-time
coordinate data is required.

## Behaviour

`VenueMap` delegates coordinate acquisition to `createGeocodingLookup` in
`lib/geocodingCache.ts`. The UI, address grouping, venue counts, links, dark map,
and geocoding bounds remain unchanged.

The helper uses `localStorage`, with keys beginning `diary:geocoding:v1:` followed
by the existing normalized geocoding query and bounds. An effective address change
causes a cache miss. Venue names are not cache keys. The only stored result fields
are `{ lat, lng, cachedAt }`; `cachedAt` is epoch milliseconds at request start.
No complete Google response or Google-formatted address is retained.

Fresh records are reused without changing their timestamp. At **29 days**, they
are invalid and are removed before another live geocode. Invalid JSON, invalid
coordinate ranges, and future timestamps are also discarded. Unreferenced keys
are pruned on Map initialization. Cleanup runs every minute while the Map is
mounted and stops on unmount. Other localStorage keys, including the theme, are
left alone.

Successful results survive page reloads and browser restarts. Failed geocodes
are not persisted and are attempted at most once per effective query per Map
initialization. Failures can be retried on a later visit. Blocked storage or quota
errors fall back to live geocoding with a console warning, without breaking markers.

## Local verification and clearing

1. Open `/map` with browser developer tools.
2. In Application → Local Storage, remove only keys beginning
   `diary:geocoding:v1:` to start an uncached run. Do not clear unrelated settings.
3. Reload and wait for the Map's final location count. Successful requests create
   records in Local Storage.
4. Reload again. In Network, filter for `GeocodeService` to inspect JavaScript
   Geocoder requests. Fresh successful addresses should produce no such requests;
   unresolved addresses may still be attempted once each. Maps JavaScript, tiles,
   and other Google resources will continue loading normally.
5. To test expiry without waiting, change one record's `cachedAt` to more than
   29 days ago and reload. That address should be geocoded again. Do not modify
   archival source data for this test.

Storage is origin-specific: `localhost:3000`, `localhost:3001`, and `127.0.0.1`
have separate caches. Private browsing and browser storage policies may prevent
persistence. Concurrent tabs may each geocode the same initial miss; there is no
cross-tab request locking.

## Policy review (14 September 2026)

The project continues using the **Maps JavaScript API Geocoder**. Google's
[geocoding strategies guide](https://developers.google.com/maps/documentation/geocoding/geocoding-strategies)
describes browser and HTTP approaches to its geocoding service. The
[Service Specific Terms, Geocoding API §6.3.1](https://cloud.google.com/maps-platform/terms/maps-service-terms)
permit temporary latitude/longitude caching for up to 30 consecutive calendar
days and require deletion afterward. The implementation uses 29 days as a margin.
The conditional indefinite-storage exception is not relied upon.

**A reuse TTL is not a guarantee of physical deletion.** Browser JavaScript
cannot run cleanup while the browser is closed or suspended, or when storage
access is denied. Expired records are never reused, but may remain on disk until
the next cleanup. Clear this development cache before leaving it unused beyond
the permitted retention period. Do not describe this browser-only mechanism as
guaranteeing Google's deletion deadline. Before public deployment, revisit the
storage architecture and its retention/deletion guarantees, including backups.

The [Geocoding policies](https://developers.google.com/maps/documentation/geocoding/policies)
and [Maps JavaScript policies](https://developers.google.com/maps/documentation/javascript/policies)
require appropriate attribution and public Terms of Use/Privacy Policy. Coordinates
remain on a Google Map with its built-in attribution; archival venue labels come
from the catalogue. Review the public policy pages before deployment. Customers
with EEA billing addresses should review the
[EEA Service Specific Terms](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms),
which also specify a 30-day temporary lat/lng caching limit (§6.2.1).

## Removed partial implementation

The unused Redis adapter, `/api/map-positions` endpoint, server refresh script,
its TypeScript configuration, and `update-geocoding-cache` npm command were
removed. `lib/geocodingCache.ts` was retained and simplified for browser storage,
reusing coordinate validation and the same address normalization and bounds.
No cloud resources or server keys were configured.
