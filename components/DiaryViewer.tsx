import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiaryImage } from "@/components/DiaryImage";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
const DEFAULT_START_DATE = "1995-01-01";
const DEFAULT_END_DATE = "1995-12-31";

type SearchItem = {
  id: string;
  title: string;
  date: string;      // YYYY-MM-DD
  location: string;
  tags: string[];
  images: string[];  // preview only (0..1)
  excerpt: string;   // short preview
};

function truncate(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  const cut = text.lastIndexOf(" ", length);
  return (cut > length * 0.6 ? text.slice(0, cut) : text.slice(0, length)) + "…";
}

export default function DiaryViewer() {
  const router = useRouter();

  // Facets (global)
  const [facetTags, setFacetTags] = useState<{ tag: string; count: number }[]>([]);
  const [facetYears, setFacetYears] = useState<{ year: string; count: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/facets")
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setFacetTags(Array.isArray(data.tags) ? data.tags : []);
          setFacetYears(Array.isArray(data.years) ? data.years : []);
        }
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // --- filter state (seed from URL if present) ---
  const [search, setSearch] = useState<string>(
    typeof router.query.q === "string" ? router.query.q : ""
  );
  const [activeTag, setActiveTag] = useState<string>(
    typeof router.query.tag === "string" ? router.query.tag : ""
  );
  const [activeYear, setActiveYear] = useState<string>(
    typeof router.query.year === "string" ? router.query.year : ""
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // what the inputs display (can differ from applied filters)
  const [draftStartDate, setDraftStartDate] = useState<string>("");
  const [draftEndDate, setDraftEndDate] = useState<string>("");

  // prime both inputs with 1995 range on first interaction, not on load
  const [datesPrimed, setDatesPrimed] = useState<boolean>(false);

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(startDate);
      setDraftEndDate(startDate);
    }
  }, [startDate, endDate]);

  // --- results & paging ---
  const [items, setItems] = useState<SearchItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(
    typeof router.query.offset === "string" ? parseInt(router.query.offset, 10) || 0 : 0
  );
  const [limit, setLimit] = useState<number>(
    typeof router.query.limit === "string" ? Math.min(100, parseInt(router.query.limit, 10) || 24) : 24
  );

  const isFiltering =
    !!search || !!activeTag || !!activeYear || !!startDate || !!endDate;

  function clearAllFilters() {
    setSearch("");
    setActiveTag("");
    setActiveYear("");
    setStartDate("");
    setEndDate("");
    setOffset(0);
  }

  // Derive “available tags/years” from the current page (cheap + good UX).
  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach(e => e.tags.forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [items]);

  const allYears = useMemo(() => {
    const s = new Set<string>();
    items.forEach(e => s.add(e.date.slice(0, 4)));
    return Array.from(s).sort();
  }, [items]);

  // Keep URL in sync so filters are shareable.
  useEffect(() => {
    const q: Record<string, string> = {};
    if (search) q.q = search;
    if (activeTag) q.tag = activeTag;
    if (activeYear) q.year = activeYear;
    if (startDate) q.startDate = startDate;
    if (endDate) q.endDate = endDate;
    if (offset) q.offset = String(offset);
    if (limit !== 24) q.limit = String(limit);

    router.replace({ pathname: "/search", query: q }, undefined, { shallow: true });    
  }, [search, activeTag, activeYear, startDate, endDate, offset, limit]);

  // Fetch when filters/paging change.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      q: search,
      tag: activeTag,
      year: activeYear,
      startDate,
      endDate,
      offset: String(offset),
      limit: String(limit),
    });

    setLoading(true);
    fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search, activeTag, activeYear, startDate, endDate, offset, limit]);

  // --- UI ---
  return (
    <main className="container mx-auto py-8 space-y-8">
      {/* Search box */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Search text or tags…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="sm:max-w-md"
        />
        <div className="flex gap-3">
          <Input
            type="date"
            value={draftStartDate}
            max={draftEndDate || undefined}
            onFocus={() => {
              if (!datesPrimed) {
                setDraftStartDate(DEFAULT_START_DATE);
                setDraftEndDate(DEFAULT_END_DATE);
                setDatesPrimed(true);
              }
            }}
            onChange={(e) => {
              const v = e.target.value;
              setDraftStartDate(v);
              setStartDate(v);     // apply filter only when the user selects a date
              setOffset(0);
            }}
            aria-label="Start date"
          />
          <Input
            type="date"
            value={draftEndDate}
            min={draftStartDate || undefined}
            onFocus={() => {
              if (!datesPrimed) {
                setDraftStartDate(DEFAULT_START_DATE);
                setDraftEndDate(DEFAULT_END_DATE);
                setDatesPrimed(true);
              }
            }}
            onChange={(e) => {
              const v = e.target.value;
              setDraftEndDate(v);
              setEndDate(v);       // apply filter only when the user selects a date
              setOffset(0);
            }}
            aria-label="End date"
          />

        </div>
        <Button variant="outline" onClick={clearAllFilters}>Clear filters</Button>
      </div>

      {facetYears.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Filter by Year</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeYear === "" ? "default" : "outline"}
              onClick={() => { setActiveYear(""); setOffset(0); }}
              className="cursor-pointer"
            >
              All
            </Badge>
            {facetYears.map(({ year, count }) => (
              <Badge
                key={year}
                variant={activeYear === year ? "default" : "outline"}
                onClick={() => { setActiveYear(year); setOffset(0); }}
                className="cursor-pointer"
                title={`${count} entr${count === 1 ? "y" : "ies"}`}
              >
                {year}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {facetTags.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Filter by Tag</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeTag === "" ? "default" : "outline"}
              onClick={() => { setActiveTag(""); setOffset(0); }}
              className="cursor-pointer"
            >
              All
            </Badge>
            {facetTags.map(({ tag, count }) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? "default" : "outline"}
                onClick={() => { setActiveTag(tag); setOffset(0); }}
                className="cursor-pointer"
                title={`${count} entr${count === 1 ? "y" : "ies"}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground mt-12">
            Loading…
          </div>
        ) : items.length > 0 ? (
          items.map((entry) => (
            <Link
              href={{ pathname: "/entry/[id]", query: { id: entry.id } }}
              key={entry.id}
              className="no-underline"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-bold">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.date)}{entry.location ? ` • ${entry.location}` : ""}
                  </p>

                  {/* tags */}
                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {[...entry.tags]
                        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                        .map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                    </div>
                  )}

                  {/* excerpt */}
                  {entry.excerpt && (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {truncate(entry.excerpt, 160)}{" "}
                      <span className="underline">Read more</span>
                    </p>
                  )}

                  {/* preview image(s) */}
                  {entry.images?.length > 0 && (
                    <div className="flex flex-wrap gap-3 items-center">
                      {entry.images.slice(0, 3).map((src, index) => (
                        <DiaryImage key={index} src={src} alt={`Diary Scan ${index + 1}`} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground mt-12">
            ❌ No results found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3 justify-center pt-2">
        <Button
          variant="outline"
          disabled={offset === 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - limit))}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {total === 0
            ? "0–0 of 0"
            : `${Math.min(offset + 1, total)}–${Math.min(offset + items.length, total)} of ${total}`}
        </span>
        <Button
          variant="outline"
          disabled={offset + limit >= total || loading}
          onClick={() => setOffset(offset + limit)}
        >
          Next
        </Button>
      </div>
    </main>
  );
}