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

export function closestSlideIndex(slideMids: readonly number[], center: number): number {
  if (slideMids.length === 0) {
    return 0;
  }
  let closest = 0;
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < slideMids.length; index += 1) {
    const nextDistance = Math.abs((slideMids[index] ?? 0) - center);
    if (nextDistance >= distance) {
      continue;
    }
    distance = nextDistance;
    closest = index;
  }
  return closest;
}

