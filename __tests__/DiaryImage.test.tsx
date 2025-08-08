/** @jest-environment jsdom */
import { render, fireEvent } from "@testing-library/react";
import { DiaryImage } from "../components/DiaryImage";

describe("DiaryImage", () => {
  it("resets error when src changes", () => {
    const { getByRole, rerender } = render(
      <DiaryImage src="/invalid.png" alt="test" />
    );
    const img = getByRole("img") as HTMLImageElement;

    fireEvent.error(img);
    expect(img.getAttribute("src")).toBe("/images/placeholder.png");

    rerender(<DiaryImage src="/valid.png" alt="test" />);
    expect(img.getAttribute("src")).toBe("/valid.png");
  });
});
