
# 90s Diary Archive

A Next.js application for exploring a personal archive of diary entries documenting the underground electronic music scene in 1990s Buenos Aires.

The app allows users to browse, search, and filter entries by text, tags, year, and date ranges, with associated scanned images for each entry.

---

## Features

* 🔍 Full-text search across diary entries
* 🏷️ Tag-based filtering (artists, venues, genres, etc.)
* 📅 Year and date range filtering
* 🖼️ Image previews with expandable galleries
* 🌙 Light / Dark mode toggle
* ⚡ Static generation for fast performance

---

## Tech Stack

* **Next.js** (Pages Router)
* **React**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui components**
* **next-themes** (dark/light mode)

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to access the app.

## Data Pipeline (Important)

This project uses a **CSV → JSON → UI** pipeline.

Diary entries are **not hardcoded** — they are generated from a CSV file.

### 1. Prepare source data

Place your CSV file here:

```
/data/diary.csv
```

### 2. Generate entries

```bash
npm run generate-entries
```

This will:

* Convert CSV → JSON
* Output files into:

```
/content/entries/
```

* Validate referenced images

---

## Images

Diary images are expected in:

```
/public/images/
```

⚠️ Note:

* Large image sets are **not included** in this repository
* You may need to add your own images locally
* Only sample images may be committed to keep repo size manageable

---

## Running Tests

```bash
npm run test
```

Tests validate:

* Entry loading logic
* Data parsing

---

## How It Works

### Static Generation

Entries are loaded at build time using `getStaticProps`, ensuring fast performance and SEO-friendly pages.

### Client-side Filtering

The search UI:

* Maintains local state for filters (text, tags, year, date range)
* Filters entries dynamically in the browser
* Displays helpful empty states when no results are found

### Theming

Dark/light mode is handled via `next-themes`, with hydration-safe rendering to prevent UI flicker.

---

## Project Structure

```
.
├── components                  # UI components
├── content/entries/            # Auto-generated JSON files
├── data/diary.csv              # Source data
├── lib/entries.ts              # Entry loading logic
├── logs                        # generateEntries logging
├── pages                       # Next.js pages
├── public/images/              # Diary scans
├── scripts/generateEntries.ts  # Content preparation script (CSV → JSON pipeline)
├── styles                      # Tailwind styles
└── types                       # TypeScript types

```

---

## ⚠️ Notes & Considerations

* This project is based on a **personal archive**
* Some content may reference real people, venues, or events
* Image assets and full datasets are intentionally limited in this repo

---

## Deployment

The app can be easily deployed using platforms like:

* **Vercel** (recommended for Next.js)
* Netlify

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

The source code is licensed under the MIT License.

Diary content and images are not covered by this license and may not be reused without permission.

## Author

Juan Natali. Senior QA Automation Engineer. 

Built as part of a personal project to preserve and explore historical music culture through modern web technologies.