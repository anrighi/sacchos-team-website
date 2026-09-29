export const HOME_CAROUSEL_INTERVAL_MS = 5000;

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return ((index % length) + length) % length;
}

export function stepIndex(index: number, length: number, delta: number): number {
  return wrapIndex(index + delta, length);
}

export function slideCenterOffset(slideLeft: number, slideWidth: number, viewportWidth: number): number {
  return slideLeft - (viewportWidth - slideWidth) / 2;
}
