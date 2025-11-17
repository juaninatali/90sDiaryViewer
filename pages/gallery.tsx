// pages/gallery.tsx
import { Layout } from "@/components/Layout";
import Gallery from "@/components/Gallery";
import { getAllEntries } from "@/lib/entries";
import { DiaryEntry } from "@/types/diary";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GalleryImageWithMeta = {
    src: string;
    alt?: string;
    entryId?: string;
    date?: string; // YYYY-MM-DD
    title?: string;
    year?: string; // derived from date
    tags?: string[]; // from entry
};

type GalleryPageProps = {
    images: GalleryImageWithMeta[];
    facets: {
        years: { year: string; count: number }[];
        tags: { tag: string; count: number }[];
    };
};

export async function getStaticProps() {
    const entries: DiaryEntry[] = getAllEntries();
    const images = entries.flatMap((e) =>
        (e.images || [])
            .filter((src) => {
                const filename = src.split("/").pop() || src;
                return !(
                    filename.startsWith("TheFirstReport") ||
                    filename.startsWith("TheSecondReport")||
                    filename.startsWith("TheThirdReport")
                );
            })
            .map((src, i) => ({
                src,
                alt: `Image ${i + 1} from "${e.title}"`,
                entryId: e.id,
                date: e.date,
                title: e.title,
                year: (e.date || "").slice(0, 4),
                tags: e.tags || [],
            }))
    );

    // Deduplicate by case-insensitive filename so each file shows once
    const uniqueImages: GalleryImageWithMeta[] = Array.from(
        images.reduce((map, img) => {
            const key = (img.src.split("/").pop() || img.src).toLowerCase();
            if (!map.has(key)) map.set(key, img);
            return map;
        }, new Map<string, typeof images[number]>()).values()
    );

    // Sort alphabetically by filename (case-insensitive)
    const sortedImages = uniqueImages.sort((a, b) => {
        const an = (a.src.split("/").pop() || a.src).toLowerCase();
        const bn = (b.src.split("/").pop() || b.src).toLowerCase();
        return an.localeCompare(bn);
    });

    // Build facets from deduplicated+sorted images
    const yearCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    for (const img of sortedImages) {
        const y = (img.year || "").trim();
        if (y) yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
        for (const t of img.tags || []) {
            if (!t) continue;
            tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
    }
    const facets = {
        years: Array.from(yearCounts.entries())
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year)),
        tags: Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { sensitivity: "base" } as any)),
    } as const;

    return { props: { images: sortedImages, facets } };
}

export default function GalleryPage({ images, facets }: GalleryPageProps) {
    const [activeYear, setActiveYear] = useState<string>("");
    const [activeTag, setActiveTag] = useState<string>("");

    const filtered = useMemo(() => {
        let list = images;
        if (activeYear) list = list.filter((img) => img.year === activeYear);
        if (activeTag) list = list.filter((img) => (img.tags || []).includes(activeTag));
        return [...list].sort((a, b) => {
            const an = (a.src.split("/").pop() || a.src).toLowerCase();
            const bn = (b.src.split("/").pop() || b.src).toLowerCase();
            return an.localeCompare(bn);
        });
    }, [images, activeYear, activeTag]);

    const isFiltering = !!activeYear || !!activeTag;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Picture Gallery</h1>

                <div className="space-y-6 mb-6">
                    {facets.years.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg">Filter by Year</h2>
                                {isFiltering && (
                                    <Button
                                        variant="outline"
                                        className="whitespace-nowrap"
                                        onClick={() => { setActiveYear(""); setActiveTag(""); }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={activeYear === "" ? "default" : "outline"}
                                    onClick={() => setActiveYear("")}
                                    className="cursor-pointer"
                                >
                                    All
                                </Badge>
                                {facets.years.map(({ year, count }) => (
                                    <Badge
                                        key={year}
                                        variant={activeYear === year ? "default" : "outline"}
                                        onClick={() => setActiveYear(year)}
                                        className="cursor-pointer"
                                        title={`${count} image${count === 1 ? "" : "s"}`}
                                    >
                                        {year}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {facets.tags.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="font-semibold text-lg">Filter by Tag</h2>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant={activeTag === "" ? "default" : "outline"}
                                    onClick={() => setActiveTag("")}
                                    className="cursor-pointer"
                                >
                                    All
                                </Badge>
                                {facets.tags.map(({ tag, count }) => (
                                    <Badge
                                        key={tag}
                                        variant={activeTag === tag ? "default" : "outline"}
                                        onClick={() => setActiveTag(tag)}
                                        className="cursor-pointer"
                                        title={`${count} image${count === 1 ? "" : "s"}`}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Gallery images={filtered} />
            </div>
        </Layout>
    );
}
