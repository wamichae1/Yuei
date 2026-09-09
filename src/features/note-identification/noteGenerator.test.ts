import assert from "node:assert/strict";
import test from "node:test";

import {
  createMusicPitch,
  generateNote,
  getNoteCandidates,
  naturalMidi,
} from "../music/noteGenerator.ts";
import {
  areNoteRangesEqual,
  getNaturalNoteStepIndex,
  getNaturalNoteSteps,
  MIN_NATURAL_NOTE_POSITIONS,
  MIN_NATURAL_NOTE_STEPS,
  updateNoteRangeBoundary,
} from "../music/noteRange.ts";
import { getVisibleKeyLabel } from "../../components/music/noteKeyboardLabels.ts";
import type {
  AccidentalMode,
  NoteRange,
} from "../music/types.ts";
import {
  applyRangeShortcut,
  DEFAULT_NOTE_RANGES,
  getActiveRangeShortcut,
} from "./config.ts";
import type { NoteIdentificationExercise } from "./types.ts";
import { isNoteIdentificationAnswerCorrect } from "./validation.ts";

const TREBLE_LIMITS: NoteRange = {
  min: { letter: "C", octave: 3 },
  max: { letter: "A", octave: 6 },
};
const BASS_LIMITS: NoteRange = {
  min: { letter: "E", octave: 1 },
  max: { letter: "C", octave: 5 },
};
const TREBLE_CUSTOM: NoteRange = {
  min: { letter: "D", octave: 4 },
  max: { letter: "G", octave: 5 },
};
const BASS_CUSTOM: NoteRange = {
  min: { letter: "F", octave: 2 },
  max: { letter: "C", octave: 4 },
};

test("slider domains cover the complete supported treble and bass ranges", () => {
  const trebleSteps = getNaturalNoteSteps(TREBLE_LIMITS);
  const bassSteps = getNaturalNoteSteps(BASS_LIMITS);

  assert.equal(trebleSteps.length, 27);
  assert.deepEqual(trebleSteps[0], { letter: "C", octave: 3 });
  assert.deepEqual(trebleSteps.at(-1), { letter: "A", octave: 6 });
  assert.equal(bassSteps.length, 27);
  assert.deepEqual(bassSteps[0], { letter: "E", octave: 1 });
  assert.deepEqual(bassSteps.at(-1), { letter: "C", octave: 5 });
});

test("range boundary updates enforce a five-position minimum span", () => {
  const minimumRange: NoteRange = {
    min: { letter: "C", octave: 4 },
    max: { letter: "G", octave: 4 },
  };
  const validMinimumRanges: readonly NoteRange[] = [
    minimumRange,
    {
      min: { letter: "D", octave: 4 },
      max: { letter: "A", octave: 4 },
    },
    {
      min: { letter: "F", octave: 4 },
      max: { letter: "C", octave: 5 },
    },
  ];

  for (const range of validMinimumRanges) {
    const steps = getNaturalNoteSteps(TREBLE_LIMITS);
    const lowerIndex = getNaturalNoteStepIndex(range.min, TREBLE_LIMITS);
    const upperIndex = getNaturalNoteStepIndex(range.max, TREBLE_LIMITS);

    assert.ok(steps.length > upperIndex);
    assert.equal(upperIndex - lowerIndex, MIN_NATURAL_NOTE_STEPS);
    assert.equal(
      upperIndex - lowerIndex + 1,
      MIN_NATURAL_NOTE_POSITIONS,
    );
  }

  const lowerClamp = updateNoteRangeBoundary(
    minimumRange,
    "min",
    { letter: "F", octave: 4 },
    TREBLE_LIMITS,
  );
  assert.deepEqual(lowerClamp, minimumRange);

  const upperClamp = updateNoteRangeBoundary(
    minimumRange,
    "max",
    { letter: "D", octave: 4 },
    TREBLE_LIMITS,
  );
  assert.deepEqual(upperClamp, minimumRange);

  const steps = getNaturalNoteSteps(TREBLE_LIMITS);
  const lowerIndex = steps.findIndex(
    (note) =>
      note.letter === lowerClamp.min.letter &&
      note.octave === lowerClamp.min.octave,
  );
  const upperIndex = steps.findIndex(
    (note) =>
      note.letter === lowerClamp.max.letter &&
      note.octave === lowerClamp.max.octave,
  );
  assert.equal(upperIndex - lowerIndex, MIN_NATURAL_NOTE_STEPS);
  assert.equal(
    upperIndex - lowerIndex + 1,
    MIN_NATURAL_NOTE_POSITIONS,
  );
});

test("slider updates prevent ranges shorter than C through G", () => {
  const attempts: readonly {
    boundary: "min" | "max";
    next: NoteRange["min"];
    expected: NoteRange;
  }[] = [
    {
      boundary: "max",
      next: { letter: "F", octave: 4 },
      expected: {
        min: { letter: "C", octave: 4 },
        max: { letter: "G", octave: 4 },
      },
    },
    {
      boundary: "max",
      next: { letter: "E", octave: 4 },
      expected: {
        min: { letter: "C", octave: 4 },
        max: { letter: "G", octave: 4 },
      },
    },
    {
      boundary: "max",
      next: { letter: "C", octave: 4 },
      expected: {
        min: { letter: "C", octave: 4 },
        max: { letter: "G", octave: 4 },
      },
    },
    {
      boundary: "min",
      next: { letter: "D", octave: 4 },
      expected: {
        min: { letter: "C", octave: 4 },
        max: { letter: "G", octave: 4 },
      },
    },
    {
      boundary: "min",
      next: { letter: "G", octave: 4 },
      expected: {
        min: { letter: "C", octave: 4 },
        max: { letter: "G", octave: 4 },
      },
    },
  ];
  const start: NoteRange = {
    min: { letter: "C", octave: 4 },
    max: { letter: "G", octave: 4 },
  };

  for (const attempt of attempts) {
    assert.deepEqual(
      updateNoteRangeBoundary(
        start,
        attempt.boundary,
        attempt.next,
        TREBLE_LIMITS,
      ),
      attempt.expected,
    );
  }
});

test("minimum-width ranges can move freely across both supported domains", () => {
  const trebleStart: NoteRange = {
    min: { letter: "C", octave: 3 },
    max: { letter: "G", octave: 3 },
  };
  const trebleEnd = updateNoteRangeBoundary(
    {
      min: { letter: "C", octave: 3 },
      max: { letter: "A", octave: 6 },
    },
    "min",
    { letter: "D", octave: 6 },
    TREBLE_LIMITS,
  );
  const bassStart: NoteRange = {
    min: { letter: "E", octave: 1 },
    max: { letter: "B", octave: 1 },
  };
  const bassEnd = updateNoteRangeBoundary(
    {
      min: { letter: "E", octave: 1 },
      max: { letter: "C", octave: 5 },
    },
    "min",
    { letter: "F", octave: 4 },
    BASS_LIMITS,
  );

  assert.deepEqual(trebleStart, {
    min: { letter: "C", octave: 3 },
    max: { letter: "G", octave: 3 },
  });
  assert.deepEqual(
    trebleEnd,
    {
      min: { letter: "D", octave: 6 },
      max: { letter: "A", octave: 6 },
    },
  );
  assert.deepEqual(
    bassStart,
    {
      min: { letter: "E", octave: 1 },
      max: { letter: "B", octave: 1 },
    },
  );
  assert.deepEqual(
    bassEnd,
    {
      min: { letter: "F", octave: 4 },
      max: { letter: "C", octave: 5 },
    },
  );
});

test("shortcuts update only the currently visible clef ranges", () => {
  const trebleOnly = applyRangeShortcut(
    {
      treble: TREBLE_CUSTOM,
      bass: BASS_CUSTOM,
    },
    "beginner",
    "treble",
  );
  assert.deepEqual(trebleOnly.treble, DEFAULT_NOTE_RANGES.treble);
  assert.deepEqual(trebleOnly.bass, BASS_CUSTOM);

  const both = applyRangeShortcut(
    {
      treble: TREBLE_CUSTOM,
      bass: BASS_CUSTOM,
    },
    "full-staff",
    "both",
  );
  assert.deepEqual(both.treble, TREBLE_LIMITS);
  assert.deepEqual(both.bass, BASS_LIMITS);
});

test("manual values resolve to Custom while exact shortcut values are recognized", () => {
  assert.equal(
    getActiveRangeShortcut(DEFAULT_NOTE_RANGES, "both"),
    "beginner",
  );
  assert.equal(
    getActiveRangeShortcut(
      { treble: TREBLE_CUSTOM, bass: DEFAULT_NOTE_RANGES.bass },
      "treble",
    ),
    "custom",
  );
  assert.equal(
    getActiveRangeShortcut(
      { treble: TREBLE_CUSTOM, bass: DEFAULT_NOTE_RANGES.bass },
      "bass",
    ),
    "beginner",
  );
});

test("arbitrary treble and bass ranges produce valid candidate sets", () => {
  for (const [clef, range] of [
    ["treble", TREBLE_CUSTOM],
    ["bass", BASS_CUSTOM],
  ] as const) {
    const candidates = getNoteCandidates({
      clef,
      range,
      accidentalMode: "sharps-and-flats",
    });
    const min = naturalMidi(range.min);
    const max = naturalMidi(range.max);

    assert.ok(candidates.length > 0);
    assert.ok(
      candidates.every((pitch) => pitch.midi >= min && pitch.midi <= max),
    );
  }
});

test("Both mode uses independently configured treble and bass ranges", () => {
  const ranges = {
    treble: TREBLE_CUSTOM,
    bass: BASS_CUSTOM,
  };
  const trebleRolls = [0, 0];
  const bassRolls = [0.9, 0];
  const treble = generateNote(
    {
      clef: "both",
      ranges,
      accidentalMode: "naturals",
    },
    () => trebleRolls.shift() ?? 0,
  );
  const bass = generateNote(
    {
      clef: "both",
      ranges,
      accidentalMode: "naturals",
    },
    () => bassRolls.shift() ?? 0,
  );

  assert.equal(treble.clef, "treble");
  assert.equal(treble.pitch.toneName, "D4");
  assert.equal(bass.clef, "bass");
  assert.equal(bass.pitch.toneName, "F2");
});

test("generated notes never leave the selected sounding-MIDI range", () => {
  for (const [clef, range] of [
    ["treble", TREBLE_CUSTOM],
    ["bass", BASS_CUSTOM],
  ] as const) {
    const min = naturalMidi(range.min);
    const max = naturalMidi(range.max);
    const candidates = getNoteCandidates({
      clef,
      range,
      accidentalMode: "sharps-and-flats",
    });

    assert.ok(
      candidates.every((candidate) => {
        const generated = generateNote(
          { clef, range, accidentalMode: "sharps-and-flats" },
          () =>
            candidates.length === 1
              ? 0
              : candidates.indexOf(candidate) / candidates.length,
        );
        return generated.pitch.midi >= min && generated.pitch.midi <= max;
      }),
    );
  }
});

function accidentalSet(mode: AccidentalMode) {
  return new Set(
    getNoteCandidates({
      clef: "treble",
      range: TREBLE_CUSTOM,
      accidentalMode: mode,
    }).map((pitch) => pitch.accidental),
  );
}

test("accidental modes preserve natural, sharp, and flat behavior", () => {
  assert.deepEqual([...accidentalSet("naturals")], [""]);
  assert.deepEqual([...accidentalSet("sharps")].sort(), ["", "#"].sort());
  assert.deepEqual([...accidentalSet("flats")].sort(), ["", "b"].sort());
  assert.deepEqual(
    [...accidentalSet("sharps-and-flats")].sort(),
    ["", "#", "b"].sort(),
  );
});

function exercise(tone: "C4" | "C5" | "C#4" | "Db4") {
  const pitch =
    tone === "C4"
      ? createMusicPitch("C", 4, "")
      : tone === "C5"
        ? createMusicPitch("C", 5, "")
        : tone === "C#4"
          ? createMusicPitch("C", 4, "#")
          : createMusicPitch("D", 4, "b");

  return {
    id: tone,
    trainingType: "note-identification",
    clef: "treble",
    pitch,
  } satisfies NoteIdentificationExercise;
}

test("answer validation remains pitch-class based and octave independent", () => {
  for (const target of ["C4", "C5"] as const) {
    assert.equal(
      isNoteIdentificationAnswerCorrect(exercise(target), {
        keyId: "c-left",
        pitchClass: 0,
        label: "C",
      }),
      true,
    );
  }
  assert.equal(
    isNoteIdentificationAnswerCorrect(exercise("C#4"), {
      keyId: "c-left",
      pitchClass: 0,
      label: "C",
    }),
    false,
  );
  assert.equal(
    isNoteIdentificationAnswerCorrect(exercise("Db4"), {
      keyId: "c-sharp-d-flat",
      pitchClass: 1,
      label: "C♯/D♭",
    }),
    true,
  );
});

test("range equality compares both endpoints", () => {
  assert.equal(areNoteRangesEqual(TREBLE_CUSTOM, TREBLE_CUSTOM), true);
  assert.equal(areNoteRangesEqual(TREBLE_CUSTOM, TREBLE_LIMITS), false);
});

test("keyboard labels can be shown or hidden without changing key values", () => {
  assert.equal(getVisibleKeyLabel("C", true), "C");
  assert.equal(getVisibleKeyLabel("C♯/D♭", true), "C♯/D♭");
  assert.equal(getVisibleKeyLabel("C", false), null);
  assert.equal(getVisibleKeyLabel("C♯/D♭", false), null);
});
