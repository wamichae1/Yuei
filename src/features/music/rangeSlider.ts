import { MIN_NATURAL_NOTE_STEPS } from "./noteRange.ts";

export type SliderThumb = "lower" | "upper";

export interface SliderDragState {
  activeThumb: SliderThumb | null;
}

export function indexToPercent(index: number, finalIndex: number): number {
  return finalIndex === 0 ? 0 : (index / finalIndex) * 100;
}

export function indexFromClientX(
  clientX: number,
  trackLeft: number,
  trackWidth: number,
  finalIndex: number,
): number {
  if (trackWidth <= 0) return 0;
  const progress = Math.min(
    1,
    Math.max(0, (clientX - trackLeft) / trackWidth),
  );
  return Math.round(progress * finalIndex);
}

export function clampLowerIndex(index: number, upperIndex: number): number {
  return Math.max(0, Math.min(index, upperIndex - MIN_NATURAL_NOTE_STEPS));
}

export function clampUpperIndex(
  index: number,
  lowerIndex: number,
  finalIndex: number,
): number {
  return Math.min(
    finalIndex,
    Math.max(index, lowerIndex + MIN_NATURAL_NOTE_STEPS),
  );
}

export function pickClosestThumb(
  pointerIndex: number,
  lowerIndex: number,
  upperIndex: number,
): SliderThumb {
  const lowerDistance = Math.abs(pointerIndex - lowerIndex);
  const upperDistance = Math.abs(pointerIndex - upperIndex);
  return lowerDistance <= upperDistance ? "lower" : "upper";
}

export function beginDrag(thumb: SliderThumb): SliderDragState {
  return { activeThumb: thumb };
}

export function endDrag(): SliderDragState {
  return { activeThumb: null };
}

export interface DragIndices {
  lowerIndex: number;
  upperIndex: number;
}

export function moveDrag(
  state: SliderDragState,
  pointerIndex: number,
  indices: DragIndices,
  finalIndex: number,
): DragIndices {
  if (state.activeThumb === null) return indices;
  if (state.activeThumb === "lower") {
    return {
      lowerIndex: clampLowerIndex(pointerIndex, indices.upperIndex),
      upperIndex: indices.upperIndex,
    };
  }
  return {
    lowerIndex: indices.lowerIndex,
    upperIndex: clampUpperIndex(
      pointerIndex,
      indices.lowerIndex,
      finalIndex,
    ),
  };
}

export function keyboardTargetIndex(
  thumb: SliderThumb,
  key: string,
  indices: DragIndices,
  finalIndex: number,
): number | null {
  const current =
    thumb === "lower" ? indices.lowerIndex : indices.upperIndex;
  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return current - 1;
    case "ArrowRight":
    case "ArrowUp":
      return current + 1;
    case "Home":
      return thumb === "lower"
        ? 0
        : indices.lowerIndex + MIN_NATURAL_NOTE_STEPS;
    case "End":
      return thumb === "lower"
        ? indices.upperIndex - MIN_NATURAL_NOTE_STEPS
        : finalIndex;
    default:
      return null;
  }
}
