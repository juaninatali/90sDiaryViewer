export type ImageKind = "archive-image" | "diary-scan";
export type ImageSurface = "entryMobile" | "entryDesktop" | "gallery";
export type ImageVisibility = Record<ImageSurface, boolean>;

// Presentation metadata lives separately from the archival source data.
export const imageCollections: readonly {
  filenamePrefix: string;
  kind: ImageKind;
}[] = [
  { filenamePrefix: "TheFirstReport_", kind: "diary-scan" },
  { filenamePrefix: "TheSecondReport_", kind: "diary-scan" },
  { filenamePrefix: "TheThirdReport_", kind: "diary-scan" },
  { filenamePrefix: "TheFourthReport_", kind: "diary-scan" },
  { filenamePrefix: "TheFifthReport_", kind: "diary-scan" },
];

export const imageVisibility: Record<ImageKind, ImageVisibility> = {
  "archive-image": { entryMobile: true, entryDesktop: true, gallery: true },
  "diary-scan": { entryMobile: false, entryDesktop: true, gallery: false },
};

// Keys are lowercase basenames, including the extension. Overrides take
// precedence over collection classification and kind visibility defaults.
export const imageOverrides: Record<string, {
  kind?: ImageKind;
  visibility?: Partial<ImageVisibility>;
}> = {};
