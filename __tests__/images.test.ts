import { getEntryImagesForViewport, isReportImage } from "@/lib/images";
import { getEntryById } from "@/lib/entries";

describe("isReportImage", () => {
  test.each([
    "TheFirstReport_001a.webp",
    "/images/TheSecondReport_0107.webp",
    "images\\TheThirdReport_0264.webp",
    "/images/custom-report-page.webp",
  ])("recognizes report image %s", (src) => {
    expect(isReportImage(src)).toBe(true);
  });

  test("does not hide ordinary archive images", () => {
    expect(isReportImage("/images/1997-Oval-30-08-97.webp")).toBe(false);
  });

  test("entry 2002 excludes report scans from the below-sm image sequence", () => {
    const entry = getEntryById("2002");
    expect(entry).not.toBeNull();

    const images = entry.images.map((src: string) => ({ src }));
    const mobileImages = getEntryImagesForViewport(images, true);
    const desktopImages = getEntryImagesForViewport(images, false);

    expect(mobileImages.map(({ src }) => src)).toEqual([
      "/images/1995-Caniche-07-95b.webp",
    ]);
    expect(desktopImages).toEqual(images);
  });
});
