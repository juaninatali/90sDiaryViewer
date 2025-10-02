import type { NextApiRequest, NextApiResponse } from "next";
import { getAllEntries } from "@/lib/entries";
import { DiaryEntry } from "@/types/diary";

// --- shape sent to the client (small + list-friendly) ---
type SearchItem = {
    id: string;
    title: string;
    date: string;         // YYYY-MM-DD
    location: string;
    tags: string[];       // keep full tags or trim if still large
    images: string[];     // 0..1 preview only
    excerpt: string;      // short text preview
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end("Method Not Allowed");
    }

    const {
        q = "",
        tag = "",
        year = "",
        startDate = "",
        endDate = "",
        offset = "0",
        limit = "24",
    } = req.query as Record<string, string>;

    const qLower = q.toLowerCase();
    const off = Math.max(0, parseInt(offset, 10) || 0);
    const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 24)); // cap for safety

    // NOTE: this keeps the heavy data server-side only
    const entries: DiaryEntry[] = getAllEntries();

    // filtering mirrors your client-side logic in components/DiaryViewer.tsx
    const filtered = entries.filter((e) => {
        const matchesSearch =
            qLower === "" ||
            e.text.toLowerCase().includes(qLower) ||
            e.tags.some((t: string) => t.toLowerCase().includes(qLower));
        const matchesTag = tag === "" || e.tags.includes(tag);
        const matchesYear = year === "" || e.date.startsWith(year);
        const matchesRange =
            (!startDate || e.date >= startDate) &&
            (!endDate || e.date <= endDate);
        return matchesSearch && matchesTag && matchesYear && matchesRange;
    });

    const total = filtered.length;

    // paginate
    const page = filtered.slice(off, off + lim);

    // project to lean shape (no full text, no big image arrays)
    const items: SearchItem[] = page.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        tags: e.tags.slice(0, 10),
        images: e.images.slice(0, 1),
        excerpt:
            e.text.length > 180
                ? e.text.slice(0, e.text.lastIndexOf(" ", 170) > 120 ? e.text.lastIndexOf(" ", 170) : 180) + "…"
                : e.text,
    }));

    res.status(200).json({
        total,
        count: items.length,
        offset: off,
        limit: lim,
        items,
    });
}