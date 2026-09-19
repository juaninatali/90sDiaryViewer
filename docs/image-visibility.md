# Image visibility

Edit `lib/imagePolicy.ts` to control image presentation independently of the
archival CSV, generated entries, and files in `public/images`.

`imageCollections` classifies the five report collections as `diary-scan` using
case-insensitive filename prefixes. Unmatched images default to `archive-image`;
the word “report” alone does not hide an image.

`imageVisibility` controls three surfaces:

| Kind | Entry below 640px | Entry at least 640px | Gallery |
| --- | --- | --- | --- |
| archive-image | Shown | Shown | Shown |
| diary-scan | Hidden | Shown | Hidden |

Entry policy also applies to search previews. Entry thumbnails, image counts,
the expand button, and lightbox navigation use the same filtered sequence.
Search previews retain their existing first-three-images limit.

For example, set `imageVisibility["diary-scan"].entryDesktop` to `false` to hide
scans on desktop entry views as well. To classify a file outside these collections
or override a particular image's visibility, add a lowercase basename to
`imageOverrides`:

```ts
export const imageOverrides: Record<string, {
  kind?: ImageKind;
  visibility?: Partial<ImageVisibility>;
}> = {
  "loose-diary-page.webp": { kind: "diary-scan" },
  "thefirstreport_001a.webp": { visibility: { entryMobile: true } },
};
```

Per-file visibility overrides take precedence over kind defaults. Unspecified
surfaces inherit the kind's policy. Basenames match regardless of slash direction,
case, or URL query/fragment. Keep basenames unique across image directories.

Rebuild and redeploy after changing policy; the gallery is cached server-side and
pages may be statically generated. No content regeneration is needed. Visibility
is presentation only: image URLs remain publicly accessible.
