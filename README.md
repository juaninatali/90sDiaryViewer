This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

```bash
npm run generate-entries
```

The project relies on Tailwind CSS's default sans-serif fonts. A custom `poppins`
font family is declared in `tailwind.config.js` and expects a CSS variable
`--font-poppins` if you wish to load your own font. The app does not currently
use `next/font`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Project Structure

```
.
├── components                  #
├── content/entries/            # auto-generated JSON files
├── data/diary.csv              # source content file
├── lib/entries.ts              # app entry loader
├── logs                        # generateEntries logging
├── pages                       #
├── public/images/              # scanned diary pages
├── scripts/generateEntries.ts  # content preparation script (CSV → JSON)
├── styles/                     #
├── types/                      #
└── 

```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
