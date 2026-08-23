import { Layout } from "@/components/Layout";
import Gallery from "@/components/Gallery";
import type { GalleryFacets, GalleryImage } from "@/lib/gallery";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [facets, setFacets] = useState<GalleryFacets>({ years: [], tags: [] });
  const [activeYear, setActiveYear] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/gallery-facets", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((data) => {
        setFacets({
          years: Array.isArray(data.years) ? data.years : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") console.error(fetchError);
      });

    return () => controller.abort();
  }, []);

  const loadPage = useCallback(async (offset: number, reset = false) => {
    if (reset) {
      requestControllerRef.current?.abort();
      loadingRef.current = false;
    }
    if (loadingRef.current) return;

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    requestControllerRef.current = controller;
    loadingRef.current = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      year: activeYear,
      tag: activeTag,
      offset: String(offset),
      limit: String(PAGE_SIZE),
    });

    try {
      const response = await fetch(`/api/gallery?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (requestId !== requestIdRef.current) return;

      const nextImages = Array.isArray(data.items) ? data.items : [];
      setImages((current) => reset ? nextImages : [...current, ...nextImages]);
      setTotal(typeof data.total === "number" ? data.total : 0);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name !== "AbortError") {
        console.error(fetchError);
        setError("The gallery could not be loaded. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [activeTag, activeYear]);

  useEffect(() => {
    setImages([]);
    setTotal(0);
    void loadPage(0, true);

    return () => requestControllerRef.current?.abort();
  }, [loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || images.length >= total) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          void loadPage(images.length);
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [images.length, loadPage, total]);

  return (
    <Layout>
      <div className="py-8">
        <div className="space-y-6 mb-6">
          {facets.years.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filter by Year</h2>
                <Button
                  variant="outline"
                  className="whitespace-nowrap"
                  onClick={() => { setActiveYear(""); setActiveTag(""); }}
                >
                  Clear filters
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={activeYear === "" ? "default" : "outline"} onClick={() => setActiveYear("")} className="cursor-pointer">
                  All
                </Badge>
                {facets.years.map(({ year, count }) => (
                  <Badge key={year} variant={activeYear === year ? "default" : "outline"} onClick={() => setActiveYear(year)} className="cursor-pointer" title={`${count} image${count === 1 ? "" : "s"}`}>
                    {year}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {facets.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filter by Tag</h2>
                <Button variant="outline" className="whitespace-nowrap" onClick={() => setShowAllTags((value) => !value)}>
                  {showAllTags ? "Show fewer tags" : "Show all tags"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={activeTag === "" ? "default" : "outline"} onClick={() => setActiveTag("")} className="cursor-pointer">
                  All
                </Badge>
                {(showAllTags ? facets.tags : facets.tags.filter(({ count }) => count > 6)).map(({ tag, count }) => (
                  <Badge key={tag} variant={activeTag === tag ? "default" : "outline"} onClick={() => setActiveTag(tag)} className="cursor-pointer" title={`${count} image${count === 1 ? "" : "s"}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Gallery images={images} />

        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        <div className="min-h-12 pt-4 text-center text-sm text-muted-foreground" aria-live="polite">
          {loading && (images.length === 0 ? "Loading gallery..." : "Loading more images...")}
          {!loading && error && (
            <div className="space-y-2">
              <p>{error}</p>
              <Button variant="outline" onClick={() => void loadPage(images.length, images.length === 0)}>
                Try again
              </Button>
            </div>
          )}
          {!loading && !error && images.length > 0 && images.length >= total && (
            <span>Showing all {total} images.</span>
          )}
        </div>
      </div>
    </Layout>
  );
}
