import { CLEF_SUPPORTED_RANGES } from "../music/noteGenerator.ts";
import { areNoteRangesEqual } from "../music/noteRange.ts";
import type {
  ClefSelection,
  MusicClef,
  NoteRange,
} from "../music/types.ts";

import type { ClefRanges } from "./types";

export type RangeShortcutId =
  | "beginner"
  | "full-octave"
  | "full-staff"
  | "custom";

interface RangeShortcut {
  id: RangeShortcutId;
  label: string;
  detail: string;
  ranges: ClefRanges | null;
}

function range(
  minLetter: NoteRange["min"]["letter"],
  minOctave: number,
  maxLetter: NoteRange["max"]["letter"],
  maxOctave: number,
): NoteRange {
  return {
    min: { letter: minLetter, octave: minOctave },
    max: { letter: maxLetter, octave: maxOctave },
  };
}

export const RANGE_SHORTCUTS: readonly RangeShortcut[] = [
  {
    id: "beginner",
    label: "Beginner",
    detail: "C–G",
    ranges: {
      treble: range("C", 4, "G", 4),
      bass: range("C", 3, "G", 3),
    },
  },
  {
    id: "full-octave",
    label: "Full Octave",
    detail: "C–C",
    ranges: {
      treble: range("C", 4, "C", 5),
      bass: range("C", 3, "C", 4),
    },
  },
  {
    id: "full-staff",
    label: "Full Staff Range",
    detail: "All positions",
    ranges: CLEF_SUPPORTED_RANGES,
  },
  {
    id: "custom",
    label: "Custom",
    detail: "Use sliders",
    ranges: null,
  },
];

export const DEFAULT_NOTE_RANGES: ClefRanges = {
  treble: range("C", 4, "G", 4),
  bass: range("C", 3, "G", 3),
};

function visibleClefs(selection: ClefSelection): readonly MusicClef[] {
  return selection === "both" ? ["treble", "bass"] : [selection];
}

export function applyRangeShortcut(
  current: ClefRanges,
  shortcutId: RangeShortcutId,
  clefSelection: ClefSelection,
): ClefRanges {
  const shortcut = RANGE_SHORTCUTS.find(
    (candidate) => candidate.id === shortcutId,
  );
  if (!shortcut?.ranges) return current;

  const next: ClefRanges = {
    treble: current.treble,
    bass: current.bass,
  };
  for (const clef of visibleClefs(clefSelection)) {
    next[clef] = shortcut.ranges[clef];
  }
  return next;
}

export function getActiveRangeShortcut(
  ranges: ClefRanges,
  clefSelection: ClefSelection,
): RangeShortcutId {
  const clefs = visibleClefs(clefSelection);
  const matchingShortcut = RANGE_SHORTCUTS.find(
    (shortcut) =>
      shortcut.ranges !== null &&
      clefs.every((clef) =>
        areNoteRangesEqual(ranges[clef], shortcut.ranges![clef]),
      ),
  );

  return matchingShortcut?.id ?? "custom";
}
