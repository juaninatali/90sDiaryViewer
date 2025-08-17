import { truncate } from "../components/DiaryViewer";

describe("truncate", () => {
  it("handles single long word", () => {
    const text = "Supercalifragilisticexpialidocious";
    expect(truncate(text, 10)).toBe("Supercalif...");
  });
});
