import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiaryImage } from "@/components/DiaryImage";
import { DiaryEntry } from "@/types/diary";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { ParsedUrlQuery } from "querystring";
import Link from "next/link";

type DiaryViewerProps = {
  entries: DiaryEntry[];
  initialQuery?: ParsedUrlQuery; // <-- add this
};

function truncate(text: string, length: number): string {
  return text.length > length
    ? text.slice(0, text.lastIndexOf("", length)) + "..."
    : text;
}

export default function DiaryViewer({ entries, initialQuery }: DiaryViewerProps) {
  const router = useRouter();
  const hydrated = useRef(false);

  // --- your existing local state ---
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeYear, setActiveYear] = useState("");
  const defaultDate = "1992-01-01";
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);

  // ---- URL <-> state helpers ----
  const parseFromQuery = (q: Record<string, any>) => ({
    search: typeof q.q === "string" ? q.q : "",
    activeTag: typeof q.tag === "string" ? q.tag : "",
    activeYear: typeof q.year === "string" ? q.year : "",
    startDate: typeof q.from === "string" ? q.from : defaultDate,
    endDate: typeof q.to === "string" ? q.to : defaultDate,
  });

  const toQueryObject = () => {
    const next: Record<string, string> = {};
    if (search) next.q = search;
    if (activeTag) next.tag = activeTag;
    if (activeYear) next.year = activeYear;
    if (startDate && startDate !== defaultDate) next.from = startDate;
    if (endDate && endDate !== defaultDate) next.to = endDate;
    return next;
  };

  // 1) Hydrate once from URL or sessionStorage
  useEffect(() => {
    if (!router.isReady || hydrated.current) return;

    const hasUrlParams = Object.keys(router.query ?? {}).length > 0;
    if (hasUrlParams) {
      const parsed = parseFromQuery(router.query as Record<string, any>);
      setSearch(parsed.search);
      setActiveTag(parsed.activeTag);
      setActiveYear(parsed.activeYear);
      setStartDate(parsed.startDate);
      setEndDate(parsed.endDate);
      hydrated.current = true;
      return;
    }

    // Fallback: sessionStorage (helps on hard refresh if URL is clean)
    try {
      const raw = sessionStorage.getItem("__search_state__");
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        const parsed = parseFromQuery(saved);
        setSearch(parsed.search);
        setActiveTag(parsed.activeTag);
        setActiveYear(parsed.activeYear);
        setStartDate(parsed.startDate);
        setEndDate(parsed.endDate);
      }
    } catch {
      /* no-op */
    } finally {
      hydrated.current = true;
    }
  }, [router.isReady, router.query]);

  // 2) Push state to URL (shallow) + mirror to sessionStorage
  useEffect(() => {
    if (!router.isReady || !hydrated.current) return;

    const nextQuery = toQueryObject();
    const currentParsed = parseFromQuery(router.query as Record<string, any>);
    const currentQuery = {
      ...(currentParsed.search ? { q: currentParsed.search } : {}),
      ...(currentParsed.activeTag ? { tag: currentParsed.activeTag } : {}),
      ...(currentParsed.activeYear ? { year: currentParsed.activeYear } : {}),
      ...(currentParsed.startDate && currentParsed.startDate !== defaultDate
        ? { from: currentParsed.startDate }
        : {}),
      ...(currentParsed.endDate && currentParsed.endDate !== defaultDate
        ? { to: currentParsed.endDate }
        : {}),
    };

    // Avoid infinite replace loops by diffing
    if (JSON.stringify(nextQuery) !== JSON.stringify(currentQuery)) {
      router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true, scroll: false }
      );
    }

    try {
      sessionStorage.setItem("__search_state__", JSON.stringify(nextQuery));
    } catch {
      /* no-op */
    }
  }, [search, activeTag, activeYear, startDate, endDate, router]);

  function clearAllFilters() {
    setSearch("");
    setActiveTag("");
    setActiveYear("");
    setStartDate(defaultDate);
    setEndDate(defaultDate);
  }

  const isFiltering =
    search !== "" ||
    activeTag !== "" ||
    activeYear !== "" ||
    startDate !== defaultDate ||
    endDate !== defaultDate;

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags))).sort(
    (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  const allYears = Array.from(new Set(entries.map((entry) => entry.date.slice(0, 4)))).sort();

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = activeTag === "" || entry.tags.includes(activeTag);
    const matchesYear = activeYear === "" || entry.date.startsWith(activeYear);
    const matchesRange =
      (!startDate || startDate === defaultDate || entry.date >= startDate) &&
      (!endDate || endDate === defaultDate || entry.date <= endDate);
    return matchesSearch && matchesTag && matchesYear && matchesRange;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Search */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Search</h2>
        <Input
          className="w-80"
          placeholder="Search by artist, venue, etc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Filter by Date Range</h2>
        <div className="flex gap-4 flex-wrap">
          <Input
            type="date"
            className="w-60"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            className="w-60"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Year Filter */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Filter by Year</h2>
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={activeYear === "" ? "default" : "outline"}
            onClick={() => setActiveYear("")}
            className="cursor-pointer"
          >
            All Years
          </Badge>
          {allYears.map((year) => (
            <Badge
              key={year}
              variant={activeYear === year ? "default" : "outline"}
              onClick={() => setActiveYear(year)}
              className="cursor-pointer"
            >
              {year}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Filter by Tag</h2>
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={activeTag === "" ? "default" : "outline"}
            onClick={() => setActiveTag("")}
            className="cursor-pointer"
          >
            All Tags
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              onClick={() => setActiveTag(tag)}
              className="cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear All Filters Button */}
      {isFiltering && (
        <div className="mt-2">
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Diary Entries */}
      <div className="grid gap-8">
        {!isFiltering ? (
          <div className="text-center text-muted-foreground mt-12">
            🔍 Start typing or filtering to see entries.
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-bold">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(entry.date)} - {entry.location}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[...entry.tags]
                      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                      .map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {truncate(entry.text, 150)}{" "}
                    <span className="text-blue-600 underline">Read more</span>
                  </p>
                  <div className="flex flex-wrap gap-4 items-center">
                    {entry.images.slice(0, 3).map((src: string, index: number) => (
                      <DiaryImage key={index} src={src} alt={`Diary Scan ${index + 1}`} />
                    ))}
                    {entry.images.length > 3 && (
                      <div className="w-48 h-[auto] flex items-center justify-center bg-black bg-opacity-60 text-white text-xl font-bold rounded border border-gray-400">
                        +{entry.images.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center text-muted-foreground mt-12">❌ No results found.</div>
        )}
      </div>
    </main>
  );
}
