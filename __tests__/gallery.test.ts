import { getGalleryFacets, getGalleryImages } from "@/lib/gallery";

describe("gallery data", () => {
  test("returns a sorted, deduplicated image index", () => {
    const images = getGalleryImages();
    const filenames = images.map((image) =>
      (image.src.split("/").pop() || image.src).toLowerCase()
    );

    expect(images.length).toBeGreaterThan(50);
    expect(new Set(filenames).size).toBe(filenames.length);
    expect(filenames).toEqual([...filenames].sort((a, b) => a.localeCompare(b)));
    expect(filenames.some((filename) => /^the(first|second|third|fourth|fifth)report/.test(filename)))
      .toBe(false);
  });

  test("builds facet counts from the gallery image index", () => {
    const images = getGalleryImages();
    const facets = getGalleryFacets();

    const countedYears = facets.years.reduce((sum, facet) => sum + facet.count, 0);
    expect(countedYears).toBe(images.length);
    expect(facets.tags.length).toBeGreaterThan(0);
  });
});
