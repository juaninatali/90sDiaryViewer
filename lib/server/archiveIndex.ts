import fs from "fs";
import path from "path";
import { getAllEntries } from "@/lib/entries";
import type { DiaryEntry } from "@/types/diary";

const entriesDirectory = path.join(process.cwd(), "content/entries");

let cachedEntries: readonly DiaryEntry[] | undefined;
let cachedDevelopmentState: string | undefined;

function getDevelopmentState(): string {
  return fs.readdirSync(entriesDirectory)
    .sort()
    .map((filename) => {
      const stats = fs.statSync(path.join(entriesDirectory, filename));
      return `${filename}:${stats.size}:${stats.mtimeMs}`;
    })
    .join("|");
}

function freezeEntry(entry: DiaryEntry): DiaryEntry {
  Object.freeze(entry.tags);
  Object.freeze(entry.images);
  return Object.freeze(entry);
}

/**
 * Returns archive source data shared by search-related server code.
 *
 * Production instances load once for their lifetime. During development, file
 * metadata is checked so regenerated or edited entry JSON is picked up without
 * requiring a dev-server restart.
 */
export function getArchiveEntries(): readonly DiaryEntry[] {
  const developmentState = process.env.NODE_ENV === "development"
    ? getDevelopmentState()
    : undefined;

  if (!cachedEntries || developmentState !== cachedDevelopmentState) {
    cachedEntries = Object.freeze(getAllEntries().map(freezeEntry));
    cachedDevelopmentState = developmentState;
  }

  return cachedEntries;
}

/** Clears the process-local index, primarily for deterministic tests. */
export function resetArchiveIndex(): void {
  cachedEntries = undefined;
  cachedDevelopmentState = undefined;
}
