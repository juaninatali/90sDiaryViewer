import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { diaryEntries } from "@/data/entries";
import { DiaryImage } from "@/components/DiaryImage";
import Link from "next/link";

function truncate(text: string, length: number): string {
  return text.length > length
    ? text.slice(0, text.lastIndexOf(" ", length)) + "..."
    : text;
}

export default function DiaryViewer() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeYear, setActiveYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isFiltering = search !== "" || activeTag !== "" || activeYear !== "" || startDate !== "" || endDate !== "";
  const allTags = Array.from(new Set(diaryEntries.flatMap(entry => entry.tags)))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const allYears = Array.from(new Set(diaryEntries.map(entry => entry.date.slice(0, 4))))
    .sort();
  const filteredEntries = diaryEntries.filter(entry => {
    const matchesSearch =
      entry.text.toLowerCase().includes(search.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = activeTag === "" || entry.tags.includes(activeTag);
    const matchesYear = activeYear === "" || entry.date.startsWith(activeYear);
    const matchesRange =
      (!startDate || entry.date >= startDate) &&
      (!endDate || entry.date <= endDate);
    return matchesSearch && matchesTag && matchesYear && matchesRange;
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">90s Diary Archive</h1>

      {/* Search */}
      <Input
        placeholder="Search by artist, venue, genre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Date Range Filter */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Filter by Date Range</h2>
        <div className="flex gap-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Year Filter */}
      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Filter by Year</h2>
        <div className="flex flex-wrap gap-2">
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
        <div className="flex flex-wrap gap-2">
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

      {/* Diary Entries */}
      <div className="grid gap-6">
        {!isFiltering ? (
          <div className="text-center text-muted-foreground mt-12">
            🔍 Start typing or filtering to see entries.
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/entry/${entry.id}`}>
              <Card className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="space-y-3 p-4">
                  <h2 className="text-xl font-bold">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">{entry.date} — {entry.location}</p>
                  <div className="flex flex-wrap gap-2">
                    {[...entry.tags]
                      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                      .map((tag) => <Badge key={tag}>{tag}</Badge>)
                    }
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {truncate(entry.text, 150)}{" "}
                    <a href={`/diary/${entry.id}`} className="text-blue-600 underline">Read more</a>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {entry.images.map((src, index) => (
                      <DiaryImage key={index} src={src} alt={`Diary Scan ${index + 1}`} />
                    ))}
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
    </div>);
}
