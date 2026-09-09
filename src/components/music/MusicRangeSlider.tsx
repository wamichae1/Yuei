"use client";

import { useRef } from "react";

import {
  formatNaturalPitch,
  getNaturalNoteStepIndex,
  getNaturalNoteSteps,
  MIN_NATURAL_NOTE_STEPS,
  updateNoteRangeBoundary,
} from "@/features/music/noteRange";
import {
  beginDrag,
  clampLowerIndex,
  clampUpperIndex,
  endDrag,
  indexFromClientX,
  indexToPercent,
  keyboardTargetIndex,
  moveDrag,
  pickClosestThumb,
  type SliderThumb,
} from "@/features/music/rangeSlider";
import type {
  MusicClef,
  NaturalPitchBoundary,
  NoteRange,
} from "@/features/music/types";

import styles from "./MusicRangeSlider.module.css";

interface MusicRangeSliderProps {
  clef: MusicClef;
  limits: NoteRange;
  value: NoteRange;
  onChange: (range: NoteRange) => void;
}

export function MusicRangeSlider({
  clef,
  limits,
  value,
  onChange,
}: MusicRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lowerThumbRef = useRef<HTMLDivElement>(null);
  const upperThumbRef = useRef<HTMLDivElement>(null);
  const activeThumb = useRef<SliderThumb | null>(null);

  const steps = getNaturalNoteSteps(limits);
  const finalIndex = steps.length - 1;
  const lowerIndex = getNaturalNoteStepIndex(value.min, limits);
  const upperIndex = getNaturalNoteStepIndex(value.max, limits);
  const lowerPercent = indexToPercent(lowerIndex, finalIndex);
  const upperPercent = indexToPercent(upperIndex, finalIndex);
  const guideNotes = steps
    .map((note, index) => ({ note, index }))
    .filter(
      ({ note, index }) =>
        note.letter === "C" || index === 0 || index === finalIndex,
    );

  const thumbRef = (thumb: SliderThumb) =>
    thumb === "lower" ? lowerThumbRef : upperThumbRef;

  const applyIndices = (lower: number, upper: number) => {
    if (lower === lowerIndex && upper === upperIndex) return;
    let next: NoteRange = value;
    if (lower !== lowerIndex) {
      next = updateNoteRangeBoundary(
        next,
        "min",
        steps[lower] as NaturalPitchBoundary,
        limits,
      );
    }
    if (upper !== upperIndex) {
      next = updateNoteRangeBoundary(
        next,
        "max",
        steps[upper] as NaturalPitchBoundary,
        limits,
      );
    }
    onChange(next);
  };

  const pointerIndex = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return lowerIndex;
    return indexFromClientX(clientX, rect.left, rect.width, finalIndex);
  };

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    thumb: SliderThumb,
  ) => {
    const state = beginDrag(thumb);
    activeThumb.current = state.activeThumb;
    thumbRef(thumb).current?.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    thumb: SliderThumb,
  ) => {
    event.stopPropagation();
    startDrag(event, thumb);
  };

  const handleTrackPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const index = pointerIndex(event.clientX);
    const thumb = pickClosestThumb(index, lowerIndex, upperIndex);
    startDrag(event, thumb);
    const next = moveDrag(
      { activeThumb: thumb },
      index,
      { lowerIndex, upperIndex },
      finalIndex,
    );
    applyIndices(next.lowerIndex, next.upperIndex);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    const thumb = activeThumb.current;
    if (!thumb) return;
    const next = moveDrag(
      { activeThumb: thumb },
      pointerIndex(event.clientX),
      { lowerIndex, upperIndex },
      finalIndex,
    );
    applyIndices(next.lowerIndex, next.upperIndex);
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLElement>,
  ) => {
    activeThumb.current = endDrag().activeThumb;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    thumb: SliderThumb,
  ) => {
    const target = keyboardTargetIndex(
      thumb,
      event.key,
      { lowerIndex, upperIndex },
      finalIndex,
    );
    if (target === null) return;
    event.preventDefault();
    if (thumb === "lower") {
      applyIndices(clampLowerIndex(target, upperIndex), upperIndex);
    } else {
      applyIndices(
        lowerIndex,
        clampUpperIndex(target, lowerIndex, finalIndex),
      );
    }
  };

  return (
    <section
      className="border-2 border-black bg-[var(--paper)] p-4 sm:p-5"
      aria-label={`${clef} clef note range`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="technical-label text-[var(--slate)]">
            {clef} clef range
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            {formatNaturalPitch(value.min)}
            <span className="mx-2 text-[var(--slate)]">—</span>
            {formatNaturalPitch(value.max)}
          </p>
        </div>
        <span className="technical-label border border-black bg-white px-2 py-1">
          {upperIndex - lowerIndex + 1} positions
        </span>
      </div>

      <div className="mt-7 px-3 pb-7">
        <div
          ref={trackRef}
          className={`relative h-7 ${styles.track}`}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 border-2 border-black bg-white" />
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 border-y-2 border-black bg-[var(--green)]"
            style={{
              left: `${lowerPercent}%`,
              width: `${upperPercent - lowerPercent}%`,
            }}
          />
          <div
            ref={lowerThumbRef}
            role="slider"
            tabIndex={0}
            className={styles.thumb}
            style={{ left: `${lowerPercent}%` }}
            aria-label="Lower note"
            aria-valuemin={0}
            aria-valuemax={upperIndex - MIN_NATURAL_NOTE_STEPS}
            aria-valuenow={lowerIndex}
            aria-valuetext={formatNaturalPitch(value.min)}
            onPointerDown={(event) =>
              handleThumbPointerDown(event, "lower")
            }
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={(event) => handleKeyDown(event, "lower")}
          />
          <div
            ref={upperThumbRef}
            role="slider"
            tabIndex={0}
            className={styles.thumb}
            style={{ left: `${upperPercent}%` }}
            aria-label="Upper note"
            aria-valuemin={lowerIndex + MIN_NATURAL_NOTE_STEPS}
            aria-valuemax={finalIndex}
            aria-valuenow={upperIndex}
            aria-valuetext={formatNaturalPitch(value.max)}
            onPointerDown={(event) =>
              handleThumbPointerDown(event, "upper")
            }
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={(event) => handleKeyDown(event, "upper")}
          />
        </div>

        <div className="relative mt-1 h-5">
          {guideNotes.map(({ note, index }) => (
            <span
              key={`${note.letter}${note.octave}`}
              className="technical-label absolute top-0 -translate-x-1/2 text-[var(--slate)]"
              style={{ left: `${indexToPercent(index, finalIndex)}%` }}
            >
              {formatNaturalPitch(note)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
