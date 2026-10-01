import { describe, expect, it } from "vitest";
import { closestSlideIndex, slideCenterOffset, stepIndex, wrapIndex } from "#/lib/carousel";

describe("wrapIndex", () => {
  it("returns 0 for an empty list", () => {
    expect(wrapIndex(3, 0)).toBe(0);
    expect(wrapIndex(-1, 0)).toBe(0);
  });

  it("wraps past both ends", () => {
    expect(wrapIndex(0, 4)).toBe(0);
    expect(wrapIndex(3, 4)).toBe(3);
    expect(wrapIndex(4, 4)).toBe(0);
    expect(wrapIndex(-1, 4)).toBe(3);
    expect(wrapIndex(7, 4)).toBe(3);
  });
});

describe("stepIndex", () => {
  it("steps forward and backward with wrap", () => {
    expect(stepIndex(0, 26, 1)).toBe(1);
    expect(stepIndex(25, 26, 1)).toBe(0);
    expect(stepIndex(0, 26, -1)).toBe(25);
  });
});

describe("slideCenterOffset", () => {
  it("centers a slide in the viewport", () => {
    expect(slideCenterOffset(0, 200, 400)).toBe(-100);
    expect(slideCenterOffset(400, 200, 400)).toBe(300);
  });
});

describe("closestSlideIndex", () => {
  it("picks the slide nearest the viewport center", () => {
    expect(closestSlideIndex([100, 300, 500], 310)).toBe(1);
    expect(closestSlideIndex([100, 300, 500], 40)).toBe(0);
    expect(closestSlideIndex([], 0)).toBe(0);
  });
});
