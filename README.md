
This repository contains a small Next.js application that displays pages from a personal Diary Archive. The project is built using TypeScript and TailwindCSS. 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The project relies on Tailwind CSS's default sans-serif fonts. The app does not currently use `next/font`.

## Getting Started

Install dependencies

```bash
npm install
```

## Execution

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the app.

## Content Preparation

Convert a data/diary.csv file into JSON files and validate referenced images

```bash
npm run generate-entries
```

Run unit tests for the entry-loading functions

```bash
npm run test
```

## Learn More

Static Generation: The diary entries are generated at build time from CSV data. Each entry is stored as its own JSON file. 

Filtering in the UI: DiaryViewer maintains state for search text, selected tags, years, and date ranges. It filters entries client‑side and shows placeholder messages when no filters are applied, or no results are found.

Theme Toggle: The app relies on next-themes for dark/light themes. The component waits for client-side hydration before showing the button to avoid mismatched rendering.

## Project Structure

```
.
├── components                  
├── content/entries/            # auto-generated JSON files
├── data/diary.csv              # source content file
├── lib/entries.ts              # app entry loader
├── logs                        # generateEntries logging
├── pages
├── public/images/              # scanned diary pages
├── scripts/generateEntries.ts  # content preparation script (CSV → JSON)
├── styles
└── types

```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
