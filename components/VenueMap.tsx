/// <reference types="google.maps" />

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveReferencedVenues, groupVenuesByAddress } from "@/lib/locations";
import { createGeocodingLookup, GEOCODING_BOUNDS } from "@/lib/geocodingCache";
import { venues } from "@/data/venues";
import type { MapEntry } from "@/types/map";

type MapsWindow = Window & {
  initArchiveMap?: () => void;
  gm_authFailure?: () => void;
};

let mapsLoader: Promise<void> | undefined;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise<void>((resolve, reject) => {
    const mapsWindow = window as MapsWindow;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 20000);
    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error("Google Maps could not load. Check your connection and Maps configuration, then reload."));
    };
    mapsWindow.initArchiveMap = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    const params = new URLSearchParams({
      key: apiKey, loading: "async", callback: "initArchiveMap", v: "weekly",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return mapsLoader;
}

export default function VenueMap({ entries }: { entries: MapEntry[] }) {
  const container = useRef<HTMLDivElement>(null);
  const resolved = useMemo(() => resolveReferencedVenues(entries, venues), [entries]);
  const [status, setStatus] = useState("Loading map...");
  const [error, setError] = useState("");

  useEffect(() => {
    const { unmatched, missingAddresses } = resolved;
    const locations = groupVenuesByAddress(resolved.locations);
    unmatched.forEach((name) => console.warn("Unmatched archive Venue tag:", name));
    missingAddresses.forEach((name) => console.warn("Archive venue has no usable catalogue address:", name));
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
    if (!apiKey?.trim() || !mapId?.trim()) {
      setError("Google Maps configuration is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAP_ID, then restart the app.");
      return;
    }

    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const markerListeners: google.maps.MapsEventListener[] = [];
    let infoWindow: google.maps.InfoWindow | undefined;
    let cacheCleanup: number | undefined;
    const mapsWindow = window as MapsWindow;
    const previousAuthFailure = mapsWindow.gm_authFailure;
    const authFailure = () => {
      if (!cancelled) setError("Google Maps authorization failed. Check the API key, allowed referrers, enabled APIs and billing, then reload.");
    };
    mapsWindow.gm_authFailure = authFailure;
    setError("");
    setStatus("Loading map...");

    async function initialize() {
      try {
        await loadGoogleMaps(apiKey!);
        const [mapsLibrary, markerLibrary, geocodingLibrary, coreLibrary] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
          google.maps.importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>,
          google.maps.importLibrary("core") as Promise<google.maps.CoreLibrary>,
        ]);
        if (cancelled || !container.current) return;
        const map = new mapsLibrary.Map(container.current, {
          center: { lat: -34.6037, lng: -58.3816 }, zoom: 12, mapId,
          colorScheme: coreLibrary.ColorScheme.DARK,
        });
        const geocoder = new geocodingLibrary.Geocoder();
        const coordinates = createGeocodingLookup(locations.map(({ address }) => address), async (query) => {
          const response = await geocoder.geocode({ address: query, bounds: GEOCODING_BOUNDS });
          const position = response.results[0]?.geometry.location;
          if (!position) throw new Error("No geocoding results");
          return { lat: position.lat(), lng: position.lng() };
        });
        cacheCleanup = window.setInterval(coordinates.prune, 60000);
        const venueInfoWindow = new mapsLibrary.InfoWindow({ headerDisabled: true });
        infoWindow = venueInfoWindow;
        const bounds = new google.maps.LatLngBounds();
        let failed = 0;
        // Sequential requests avoid sending the entire archive in one burst.
        for (const [index, location] of locations.entries()) {
          if (cancelled) return;
          setStatus(`Locating archive addresses (${markers.length + failed}/${locations.length})...`);
          try {
            const position = await coordinates.lookup(location.address);
            if (cancelled) return;
            const marker = new markerLibrary.AdvancedMarkerElement({
              map, position, title: location.name,
              zIndex: locations.length - index,
            });
            markers.push(marker);
            markerListeners.push(marker.addListener("click", () => {
              const content = document.createElement("div");
              content.className = "relative space-y-3 p-1 pr-8 text-gray-900";
              const address = document.createElement("p");
              address.className = "text-sm";
              address.textContent = location.address;
              for (const venue of location.venues) {
                const section = document.createElement("section");
                const name = document.createElement("h2");
                name.className = "text-lg font-semibold";
                name.textContent = venue.name;
                const entryCount = new Set(venue.entries.map(({ id }) => id)).size;
                const details = document.createElement("p");
                details.className = "text-sm";
                details.append(`${entryCount} diary ${entryCount === 1 ? "entry" : "entries"} · `);
                const link = document.createElement("a");
                link.textContent = "View entries";
                link.className = "text-blue-700 underline";
                link.href = `/search?tag=${encodeURIComponent(`Venue: ${venue.name}`)}`;
                details.append(link);
                section.append(name, details);
                content.append(section);
              }
              content.append(address);
              const close = document.createElement("button");
              close.type = "button";
              close.setAttribute("aria-label", "Close venue information");
              close.className = "absolute right-0 top-0 rounded px-1 text-xl leading-none hover:bg-gray-100 focus-visible:outline";
              close.textContent = "×";
              close.addEventListener("click", () => venueInfoWindow.close());
              // Position the control independently of the content's vertical spacing.
              const wrapper = document.createElement("div");
              wrapper.className = "relative";
              wrapper.append(content, close);
              venueInfoWindow.setContent(wrapper);
              venueInfoWindow.open({ map, anchor: marker });
            }));
            bounds.extend(position);
          } catch (geocodingError) {
            if (cancelled) return;
            failed++;
            console.warn("Could not geocode archive venue:", location.name, location.address);
            if (typeof geocodingError === "object" && geocodingError !== null
              && "code" in geocodingError && geocodingError.code === "REQUEST_DENIED") {
              setError("Google denied geocoding access. Check that the Geocoding API is enabled and allowed by the API key restrictions, then reload.");
            }
          }
        }
        if (cancelled) return;
        if (markers.length) map.fitBounds(bounds, 48);
        setStatus(locations.length === 0
          ? "No archive locations are available."
          : `${markers.length} of ${locations.length} archive locations shown.${failed ? ` ${failed} addresses could not be located.` : ""}`);
      } catch {
        if (!cancelled) setError("Google Maps could not be initialized. Check your connection and Maps configuration, then reload.");
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      window.clearInterval(cacheCleanup);
      infoWindow?.close();
      markerListeners.forEach((listener) => listener.remove());
      markers.forEach((marker) => { marker.map = null; });
      if (mapsWindow.gm_authFailure === authFailure) mapsWindow.gm_authFailure = previousAuthFailure;
    };
  }, [resolved]);

  return (
    <section aria-label="Archive locations">
      {error ? <p role="alert" className="mb-4 text-destructive">{error}</p>
        : <p role="status" className="mb-4 text-sm text-muted-foreground">{status}</p>}
      <div ref={container} aria-label="Map of Buenos Aires archive locations"
        className="h-[65vh] min-h-96 w-full rounded-lg border" />
    </section>
  );
}
