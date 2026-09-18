import fs from "fs";
import { getAllEntries } from "@/lib/entries";
import {
  getArchiveEntries,
  resetArchiveIndex,
} from "@/lib/server/archiveIndex";
import type { DiaryEntry } from "@/types/diary";

jest.mock("@/lib/entries", () => ({
  getAllEntries: jest.fn(),
}));

const mockedGetAllEntries = jest.mocked(getAllEntries);
const mutableEnvironment = process.env as { NODE_ENV?: string };

function makeEntry(title: string): DiaryEntry {
  return {
    id: "1",
    title,
    date: "1995-01-01",
    location: "Buenos Aires",
    tags: ["Venue: Test"],
    text: "Archive text",
    images: ["/images/test.jpg"],
  };
}

describe("server archive index", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    resetArchiveIndex();
    mockedGetAllEntries.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    mutableEnvironment.NODE_ENV = originalNodeEnv;
  });

  test("loads once and reuses immutable entries in a production instance", () => {
    mutableEnvironment.NODE_ENV = "production";
    mockedGetAllEntries.mockReturnValue([makeEntry("Cached")]);

    const first = getArchiveEntries();
    const second = getArchiveEntries();

    expect(second).toBe(first);
    expect(mockedGetAllEntries).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first[0])).toBe(true);
    expect(Object.isFrozen(first[0].tags)).toBe(true);
    expect(Object.isFrozen(first[0].images)).toBe(true);
  });

  test("reloads in development when entry file metadata changes", () => {
    mutableEnvironment.NODE_ENV = "development";
    jest.spyOn(fs, "readdirSync").mockReturnValue(
      ["1.json"] as unknown as ReturnType<typeof fs.readdirSync>,
    );
    const statSpy = jest.spyOn(fs, "statSync")
      .mockReturnValueOnce({ size: 10, mtimeMs: 1 } as fs.Stats)
      .mockReturnValueOnce({ size: 11, mtimeMs: 2 } as fs.Stats)
      .mockReturnValueOnce({ size: 11, mtimeMs: 2 } as fs.Stats);
    mockedGetAllEntries
      .mockReturnValueOnce([makeEntry("Before")])
      .mockReturnValueOnce([makeEntry("After")]);

    const first = getArchiveEntries();
    const second = getArchiveEntries();
    const third = getArchiveEntries();

    expect(process.env.NODE_ENV).toBe("development");
    expect(statSpy).toHaveBeenCalledTimes(3);
    expect(first[0].title).toBe("Before");
    expect(second[0].title).toBe("After");
    expect(third).toBe(second);
    expect(mockedGetAllEntries).toHaveBeenCalledTimes(2);

  });
});
