import type {
  NaturalPitchBoundary,
  NoteLetter,
  NoteRange,
} from "./types";

const LETTERS: readonly NoteLetter[] = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B",
];

export const MIN_NATURAL_NOTE_POSITIONS = 5;
export const MIN_NATURAL_NOTE_STEPS =
  MIN_NATURAL_NOTE_POSITIONS - 1;

function naturalStepIndex(note: NaturalPitchBoundary): number {
  return note.octave * LETTERS.length + LETTERS.indexOf(note.letter);
}

export function formatNaturalPitch(note: NaturalPitchBoundary): string {
  return `${note.letter}${note.octave}`;
}

export function areNaturalPitchesEqual(
  a: NaturalPitchBoundary,
  b: NaturalPitchBoundary,
): boolean {
  return a.letter === b.letter && a.octave === b.octave;
}

export function areNoteRangesEqual(a: NoteRange, b: NoteRange): boolean {
  return (
    areNaturalPitchesEqual(a.min, b.min) &&
    areNaturalPitchesEqual(a.max, b.max)
  );
}

export function getNaturalNoteSteps(
  limits: NoteRange,
): NaturalPitchBoundary[] {
  const minIndex = naturalStepIndex(limits.min);
  const maxIndex = naturalStepIndex(limits.max);

  if (minIndex > maxIndex) {
    throw new Error("Note range minimum must not exceed its maximum.");
  }

  return Array.from({ length: maxIndex - minIndex + 1 }, (_, offset) => {
    const index = minIndex + offset;
    return {
      letter: LETTERS[index % LETTERS.length],
      octave: Math.floor(index / LETTERS.length),
    };
  });
}

export function getNaturalNoteStepIndex(
  note: NaturalPitchBoundary,
  limits: NoteRange,
): number {
  const steps = getNaturalNoteSteps(limits);
  const index = steps.findIndex((candidate) =>
    areNaturalPitchesEqual(candidate, note),
  );

  if (index === -1) {
    throw new Error(
      `${formatNaturalPitch(note)} is outside the supported note range.`,
    );
  }

  return index;
}

export function updateNoteRangeBoundary(
  range: NoteRange,
  boundary: "min" | "max",
  next: NaturalPitchBoundary,
  limits: NoteRange,
): NoteRange {
  const steps = getNaturalNoteSteps(limits);
  const nextIndex = getNaturalNoteStepIndex(next, limits);
  const currentMinIndex = getNaturalNoteStepIndex(range.min, limits);
  const currentMaxIndex = getNaturalNoteStepIndex(range.max, limits);

  if (boundary === "min") {
    return {
      min: steps[
        Math.min(
          nextIndex,
          currentMaxIndex - MIN_NATURAL_NOTE_STEPS,
        )
      ],
      max: range.max,
    };
  }

  return {
    min: range.min,
    max: steps[
      Math.max(
        nextIndex,
        currentMinIndex + MIN_NATURAL_NOTE_STEPS,
      )
    ],
  };
}
