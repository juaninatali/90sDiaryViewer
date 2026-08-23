import type { NextApiRequest, NextApiResponse } from "next";
import { getGalleryImages } from "@/lib/gallery";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }

  const value = (key: string) =>
    typeof req.query[key] === "string" ? req.query[key] : "";
  const year = value("year");
  const tag = value("tag");
  const parsedOffset = parseInt(value("offset"), 10);
  const parsedLimit = parseInt(value("limit"), 10);
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0;
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(100, parsedLimit))
    : 50;

  const filtered = getGalleryImages().filter(
    (image) =>
      (!year || image.year === year) &&
      (!tag || image.tags.includes(tag))
  );
  const items = filtered.slice(offset, offset + limit);

  res.status(200).json({
    items,
    total: filtered.length,
    count: items.length,
    offset,
    limit,
  });
}
