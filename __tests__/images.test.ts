import { isReportImage } from "@/lib/images";

describe("isReportImage", () => {
  test.each([
    "TheFirstReport_001a.webp",
    "/images/TheSecondReport_0107.webp",
    "images\\TheThirdReport_0264.webp",
    "/images/custom-report-page.webp",
  ])("recognizes report image %s", (src) => {
    expect(isReportImage(src)).toBe(true);
  });

  test("does not hide ordinary archive images", () => {
    expect(isReportImage("/images/1997-Oval-30-08-97.webp")).toBe(false);
  });
});
