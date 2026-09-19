import {
  imageCollections,
  imageOverrides,
  imageVisibility,
  type ImageKind,
  type ImageSurface,
} from "@/lib/imagePolicy";

function imageFilename(src: string): string {
  return (src.split(/[?#]/)[0].split(/[\\/]/).pop() || "").toLowerCase();
}

export function getImageKind(src: string): ImageKind {
  const filename = imageFilename(src);
  return imageOverrides[filename]?.kind
    ?? imageCollections.find(({ filenamePrefix }) =>
      filename.startsWith(filenamePrefix.toLowerCase())
    )?.kind
    ?? "archive-image";
}

export function isImageVisible(src: string, surface: ImageSurface): boolean {
  return imageOverrides[imageFilename(src)]?.visibility?.[surface]
    ?? imageVisibility[getImageKind(src)][surface];
}

export function getEntryImageVisibilityClass(src: string): string {
  const mobile = isImageVisible(src, "entryMobile");
  const desktop = isImageVisible(src, "entryDesktop");
  if (mobile && desktop) return "block";
  if (mobile) return "block sm:hidden";
  return desktop ? "hidden sm:block" : "hidden";
}

export function getEntryImagesForViewport<T extends { src: string }>(
  images: T[],
  belowSm: boolean
): T[] {
  const surface: ImageSurface = belowSm ? "entryMobile" : "entryDesktop";
  return images.filter((image) => isImageVisible(image.src, surface));
}
