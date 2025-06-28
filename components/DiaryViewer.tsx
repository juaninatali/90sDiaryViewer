import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DiaryImage } from "@/components/DiaryImage";
import { DiaryEntry } from "@/types/diary";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

function truncate(text: string, length: number): string {
  return text.length > length
    ? text.slice(0, text.lastIndexOf(" ", length)) + "..."
    : text;
}

export default function DiaryViewer({ entries }: { entries: DiaryEntry[] }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeYear, setActiveYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function clearAllFilters() {
    setSearch("");
    setActiveTag("");
    setActiveYear("");
    setStartDate("");
    setEndDate("");
  }

  const isFiltering = search !== "" || activeTag !== "" || activeYear !== "" || startDate !== "" || endDate !== "";
  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const allYears = Array.from(new Set(entries.map(entry => entry.date.slice(0, 4))))
    .sort();

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.text.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = activeTag === "" || entry.tags.includes(activeTag);
    const matchesYear = activeYear === "" || entry.date.startsWith(activeYear);
    const matchesRange =
      (!startDate || entry.date >= startDate) &&
      (!endDate || entry.date <= endDate);
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
                  <p className="text-sm text-muted-foreground">{formatDate(entry.date)} - {entry.location}</p>
                  <div className="flex flex-wrap gap-3">
                    {[...entry.tags]
                      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                      .map((tag) => <Badge key={tag}>{tag}</Badge>)
                    }
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
          <div className="text-center text-muted-foreground mt-12">
            ❌ No results found.
          </div>
        )}
      </div>
    </main>
  );
}
