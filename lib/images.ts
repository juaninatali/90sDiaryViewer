export function isReportImage(src: string): boolean {
  const filename = src.split(/[\\/]/).pop() || src;
  return /report/i.test(filename);
}

export function getEntryImagesForViewport<T extends { src: string }>(
  images: T[],
  belowSm: boolean
): T[] {
  return belowSm ? images.filter((image) => !isReportImage(image.src)) : images;
}
