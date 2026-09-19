import { getEntryImagesForViewport, getEntryImageVisibilityClass, getImageKind, isImageVisible } from "@/lib/images";
import { imageOverrides, imageVisibility } from "@/lib/imagePolicy";
import { getEntryById } from "@/lib/entries";

describe("image presentation policy", () => {
  test.each([
    "TheFirstReport_001a.webp",
    "/images/TheSecondReport_0107.webp",
    "images\\TheThirdReport_0264.webp",
    "/images/TheFourthReport_0300.webp",
    "/images/TheFifthReport_0451.webp",
    "/images/THEFIRSTREPORT_001a.webp?width=100#preview",
  ])("recognizes report image %s", (src) => {
    expect(getImageKind(src)).toBe("diary-scan");
    expect(isImageVisible(src, "entryMobile")).toBe(false);
    expect(isImageVisible(src, "entryDesktop")).toBe(true);
    expect(isImageVisible(src, "gallery")).toBe(false);
    expect(getEntryImageVisibilityClass(src)).toBe("hidden sm:block");
  });

  test("does not hide ordinary archive images", () => {
    for (const src of ["/images/1997-Oval-30-08-97.webp", "/images/custom-report-page.webp"]) {
      expect(getImageKind(src)).toBe("archive-image");
      expect(isImageVisible(src, "entryMobile")).toBe(true);
      expect(isImageVisible(src, "gallery")).toBe(true);
    }
  });

  test("kind configuration changes entry selection and preview visibility together", () => {
    const src = "/images/TheFirstReport_001a.webp";
    const previous = imageVisibility["diary-scan"];
    try {
      imageVisibility["diary-scan"] = { entryMobile: true, entryDesktop: false, gallery: true };
      expect(getEntryImagesForViewport([{ src }], true)).toEqual([{ src }]);
      expect(getEntryImagesForViewport([{ src }], false)).toEqual([]);
      expect(getEntryImageVisibilityClass(src)).toBe("block sm:hidden");
      expect(isImageVisible(src, "gallery")).toBe(true);
    } finally {
      imageVisibility["diary-scan"] = previous;
    }
  });

  test("per-file metadata takes precedence and filtering preserves order and objects", () => {
    imageOverrides["custom.webp"] = { kind: "diary-scan", visibility: { entryMobile: true } };
    imageOverrides["flyer.webp"] = { visibility: { entryMobile: false, entryDesktop: false } };
    const images = [{ src: "/images/custom.webp", alt: "Custom" }, { src: "flyer.webp", alt: "Flyer" }];
    try {
      expect(getImageKind("images\\custom.webp")).toBe("diary-scan");
      expect(getEntryImagesForViewport(images, true)).toEqual([images[0]]);
      expect(getEntryImagesForViewport(images, true)[0]).toBe(images[0]);
      expect(images).toHaveLength(2);
      expect(isImageVisible("custom.webp", "gallery")).toBe(false);
      expect(getEntryImageVisibilityClass("flyer.webp")).toBe("hidden");
      expect(getEntryImagesForViewport([], true)).toEqual([]);
    } finally {
      delete imageOverrides["custom.webp"];
      delete imageOverrides["flyer.webp"];
    }
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
