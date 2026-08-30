import { getAllEntries } from "@/lib/entries";
import { DiaryEntry } from "@/types/diary";
import { isReportImage } from "@/lib/images";

export type GalleryImage = {
  src: string;
  alt: string;
  entryId: string;
  date: string;
  title: string;
  year: string;
  tags: string[];
};

export type GalleryFacets = {
  years: { year: string; count: number }[];
  tags: { tag: string; count: number }[];
};

let galleryImagesCache: GalleryImage[] | undefined;

export function getGalleryImages(): GalleryImage[] {
  if (galleryImagesCache) return galleryImagesCache;

  const entries: DiaryEntry[] = getAllEntries();
  const images = entries.flatMap((entry) =>
    (entry.images || [])
      .filter((src) => !isReportImage(src))
      .map((src, index) => ({
        src,
        alt: `Image ${index + 1} from "${entry.title}"`,
        entryId: entry.id,
        date: entry.date,
        title: entry.title,
        year: entry.date.slice(0, 4),
        tags: entry.tags || [],
      }))
  );

  const uniqueImages = Array.from(
    images.reduce((map, image) => {
      const key = (image.src.split("/").pop() || image.src).toLowerCase();
      if (!map.has(key)) map.set(key, image);
      return map;
    }, new Map<string, GalleryImage>()).values()
  );

  galleryImagesCache = uniqueImages.sort((a, b) => {
    const aName = (a.src.split("/").pop() || a.src).toLowerCase();
    const bName = (b.src.split("/").pop() || b.src).toLowerCase();
    return aName.localeCompare(bName);
  });

  return galleryImagesCache;
}

export function getGalleryFacets(): GalleryFacets {
  const yearCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const image of getGalleryImages()) {
    if (image.year) {
      yearCounts.set(image.year, (yearCounts.get(image.year) || 0) + 1);
    }
    for (const tag of image.tags) {
      if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return {
    years: Array.from(yearCounts, ([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year)),
    tags: Array.from(tagCounts, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { sensitivity: "base" })),
  };
}
