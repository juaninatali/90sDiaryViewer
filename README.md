# 90s Diary Archive

A Next.js application for exploring a personal archive of diary entries documenting the underground electronic music scene in 1990s Buenos Aires.

The app allows users to browse diary entries, search the archive, explore scanned images, and discover the archival locations of venues referenced in the diaries.


## Features

- Search diary text and tags, with tag, year, and date-range filters
- Paginated search results with excerpts and image previews
- Individual diary pages with archival text and image viewing
- A dedicated image gallery with year/tag filters and incremental loading
- An interactive Google Map of venues referenced by diary Venue tags
- Clickable map InfoWindows displaying archival venue names and addresses
- Light and dark theme
- Static generation for fast performance


## Tech Stack

- Next.js 15, using the Pages Router and API routes
- React 19 and TypeScript
- Tailwind CSS, shadcn/ui components, and next-themes
- Google Maps JavaScript API, Geocoder, and Advanced Markers
- csv-parse for CSV imports
- Jest, ts-jest, and React Testing Library


## Getting Started

Install dependencies:

```bash
npm install
```

Prepare the local diary JSON and image assets described below, then start development:

```bash
npm run dev
```

The current development script uses the Windows `start` command to open the browser. On other platforms, run `npx next dev --turbopack` directly.


## Archival data

This project uses a **CSV → JSON → UI** pipeline.

Diary entries are **not hardcoded** — they are generated from a CSV file.

### 1. Prepare source data

Place your CSV file here: `/data/diary.csv`

### 2. Generate entries

```bash
npm run generate-entries
```

This will:

- Convert CSV → JSON
- Output files into: `/content/entries/`
- Validate referenced images

Diary content is archival source material: application changes should not rewrite the CSV, generated content, or historical wording.


## Images

Place diary scans in `public/images/`. The full image collection is not included in Git; the ignore rules retain only the designated placeholder and banner assets.


## How it works

### Search

`DiaryViewer` requests filtered, paginated results from `/api/search` and filter options from `/api/facets`. Search filters operate on the server, and URL parameters retain the selected search state.

The response contains entry summaries, short excerpts, and up to three preview images per entry rather than the full archive. The current server implementation still reads and parses the archive through `getAllEntries()` for each search/facet request; a shared search index or read cache has not been implemented.

### Gallery

`/api/gallery` supplies image batches and `/api/gallery-facets` supplies filter options. The Gallery builds an image index from diary entries and caches it in the server process. Restart the server after changing source entries if an existing process has already built that index.

### Map

The Map follows this data flow:

```text
Diary Venue tags
  → unique referenced venue names
  → exact matches in data/venues.ts
  → shared-address groups
  → runtime Google geocoding
  → Advanced Markers and InfoWindows
```


### Rendering and deployment

Individual diary pages and Map entry metadata use static generation. Search and Gallery rely on server API routes, so deployment must support the Next.js server rather than only static file hosting.

For a local production build:

```bash
npm run build
npm run start
```

Ensure diary JSON, images, and Map configuration are available to the relevant build/runtime environment. Avoid building into the same `.next` directory while a development server is using it.

## Scripts and validation

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development with Turbopack and open the browser on Windows |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run generate-entries` | Import diary CSV into entry JSON |
| `npm run generate-venues` | Replace the venue catalogue from its CSV source |
| `npm test` | Run the Jest suite |
| `npm run lint` | Run the existing Next.js lint command |

The test suite covers entry loading, text truncation, image handling, Gallery indexing, venue CSV parsing, venue resolution and address grouping, Map props projection, and Map component behaviour with mocked Google Maps APIs.


## Project Structure

```
.
├── components                  # Shared UI components
├── content/entries/            # Generated diary JSON (local)
├── data                        # Diary source data
├── lib                         # Diary loading logic
├── pages                       # Next.js page router screens and entry pages
├── public/images/              # Local archival scans
├── scripts                     # Diary & Venue importer scripts
├── styles                      # Tailwind application styles
├── types                       # TypeScript types
└── __tests__/                  # Jest tests
```


## ⚠️ Notes & Considerations

- This project is based on a **personal archive**
- Some content may reference real people, venues, or events
- Image assets and full datasets are intentionally limited in this repo


## License

The source code is licensed under the MIT License.

Diary content and images are not covered by this license and may not be reused without permission.

## Author

Juan I. Natali. Senior QA Automation Engineer. 

Built as part of a personal project to preserve and explore historical music culture through modern web technologies.