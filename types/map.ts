import type { DiaryEntry } from "@/types/diary";

export type MapEntry = Pick<DiaryEntry, "id" | "date" | "tags">;
