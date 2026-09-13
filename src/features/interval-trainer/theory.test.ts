import assert from "node:assert/strict";
import test from "node:test";

import { getMusicPlaybackDurationMs } from "../music/audio.ts";
import { buildIntervalBreakdown } from "./results.ts";
import {
  createIntervalExercise,
  INTERVAL_DEFINITIONS,
  INTERVAL_ORDER,
  INTERVAL_PLAYBACK_PATTERN_CONFIG,
  PRODUCT_RCM_LEVEL_PRESETS,
  resolveIntervalConfig,
} from "./theory.ts";
import {
  formatIntervalPlayback,
  getIntervalPlaybackEvents,
  getIntervalPlaybackLabel,
  getIntervalPlaybackPlan,
} from "./playback.ts";
import type {
  IntervalId,
  IntervalPlaybackPattern,
  IntervalPresentation,
  IntervalTrainerConfig,
  RcmLevel,
} from "./types.ts";

const EXPECTED_PRESETS: Record<RcmLevel, readonly IntervalId[]> = {
  1: ["M3", "m3"],
  2: ["M3", "m3", "P5"],
  3: ["M3", "m3", "P5", "P4"],
  4: ["M3", "m3", "P5", "P4", "P8"],
  5: ["M3", "m3", "P5", "P4", "P8", "M6", "m6"],
  6: ["M3", "m3", "P5", "P4", "P8", "M6", "m6", "M2", "m2"],
  7: [
    "M3",
    "m3",
    "P5",
    "P4",
    "P8",
    "M6",
    "m6",
    "M2",
    "m2",
    "M7",
    "m7",
  ],
  8: [
    "M3",
    "m3",
    "P5",
    "P4",
    "P8",
    "M6",
    "m6",
    "M2",
    "m2",
    "M7",
    "m7",
    "tritone",
  ],
  9: [
    "M3",
    "m3",
    "P5",
    "P4",
    "P8",
    "M6",
    "m6",
    "M2",
    "m2",
    "M7",
    "m7",
    "tritone",
  ],
  10: [
    "M3",
    "m3",
    "P5",
    "P4",
    "P8",
    "M6",
    "m6",
    "M2",
    "m2",
    "M7",
    "m7",
    "tritone",
    "M9",
    "m9",
  ],
};

test("product-defined RCM presets exactly match the supplied progression", () => {
  for (let level = 1; level <= 10; level += 1) {
    const typedLevel = level as RcmLevel;
    assert.deepEqual(
      PRODUCT_RCM_LEVEL_PRESETS[typedLevel].intervals,
      EXPECTED_PRESETS[typedLevel],
    );
  }
});

test("RCM levels are all melodic and map to a centralized playback pattern", () => {
  const expectedPattern: Record<RcmLevel, IntervalPlaybackPattern> = {
    1: "ascending-then-descending",
    2: "ascending-then-descending",
    3: "ascending-then-descending",
    4: "ascending-then-descending",
    5: "directional-then-harmonic",
    6: "directional-then-harmonic",
    7: "directional-then-harmonic",
    8: "directional-then-harmonic",
    9: "directional-then-harmonic",
    10: "directional-only",
  };
  const melodicOnly: readonly IntervalPresentation[] = [
    "melodic-ascending",
    "melodic-descending",
  ];
  for (let level = 1; level <= 10; level += 1) {
    const preset = PRODUCT_RCM_LEVEL_PRESETS[level as RcmLevel];
    assert.equal(preset.playbackPattern, expectedPattern[level as RcmLevel]);
    // Standalone "harmonic" is never a randomly selected RCM presentation; it
    // is injected by the level's playback pattern instead.
    assert.deepEqual(preset.presentations, melodicOnly);
    assert.equal(
      typeof INTERVAL_PLAYBACK_PATTERN_CONFIG[preset.playbackPattern].label,
      "string",
    );
  }
});

test("resolved custom configuration is sorted and selects custom playback", () => {
  const config: IntervalTrainerConfig = {
    setupMode: "custom",
    rcmLevel: 1,
    sessionModeId: "unlimited",
    custom: {
      intervals: ["M9", "m2", "P5"],
      presentations: ["harmonic"],
    },
  };

  assert.deepEqual(resolveIntervalConfig(config), {
    intervals: ["m2", "P5", "M9"],
    presentations: ["harmonic"],
    playbackPattern: "selected-presentation",
    clef: "treble",
  });
});

test("every interval generates the correct chromatic and diatonic distance", () => {
  const letters = ["C", "D", "E", "F", "G", "A", "B"];
  const presentations: readonly IntervalPresentation[] = [
    "melodic-ascending",
    "melodic-descending",
    "harmonic",
  ];

  for (const intervalId of INTERVAL_ORDER) {
    for (const presentation of presentations) {
      for (let rootIndex = 0; rootIndex < 8; rootIndex += 1) {
        const values = [0, 0, (rootIndex + 0.1) / 8];
        let randomCall = 0;
        const exercise = createIntervalExercise(
          {
            intervals: [intervalId],
            presentations: [presentation],
            playbackPattern: "selected-presentation",
            clef: "treble",
          },
          () => values[randomCall++] ?? 0,
        );
        const definition = INTERVAL_DEFINITIONS[intervalId];
        const chromaticDistance =
          exercise.upperNote.midi - exercise.lowerNote.midi;
        const lowerLetterIndex =
          exercise.lowerNote.octave * 7 +
          letters.indexOf(exercise.lowerNote.letter);
        const upperLetterIndex =
          exercise.upperNote.octave * 7 +
          letters.indexOf(exercise.upperNote.letter);

        assert.equal(chromaticDistance, definition.semitones);
        assert.equal(
          upperLetterIndex - lowerLetterIndex + 1,
          definition.diatonicNumber,
        );
        assert.ok(["", "#", "b"].includes(exercise.upperNote.accidental));

        if (presentation === "melodic-descending") {
          assert.equal(exercise.notes[0], exercise.upperNote);
          assert.equal(exercise.notes[1], exercise.lowerNote);
        } else {
          assert.equal(exercise.notes[0], exercise.lowerNote);
          assert.equal(exercise.notes[1], exercise.upperNote);
        }
      }
    }
  }
});

test("interval breakdown sorts weak performance first", () => {
  const makeExercise = (intervalId: IntervalId) =>
    createIntervalExercise(
      {
        intervals: [intervalId],
        presentations: ["harmonic"],
        playbackPattern: "selected-presentation",
        clef: "treble",
      },
      () => 0,
    );
  const now = Date.now();
  const attempts = [
    {
      exercise: makeExercise("M3"),
      answer: "M3" as IntervalId,
      correct: true,
      startedAtMs: now,
      answeredAtMs: now,
    },
    {
      exercise: makeExercise("m3"),
      answer: "M3" as IntervalId,
      correct: false,
      startedAtMs: now,
      answeredAtMs: now,
    },
    {
      exercise: makeExercise("m3"),
      answer: "m3" as IntervalId,
      correct: true,
      startedAtMs: now,
      answeredAtMs: now,
    },
  ];

  assert.deepEqual(
    buildIntervalBreakdown(attempts).map((row) => ({
      id: row.intervalId,
      score: `${row.correct}/${row.attempted}`,
    })),
    [
      { id: "m3", score: "1/2" },
      { id: "M3", score: "1/1" },
    ],
  );
});

function makePatternExercise(
  pattern: IntervalPlaybackPattern,
  presentationRoll: number,
  rootRoll: number,
) {
  let call = 0;
  const values = [0, presentationRoll, rootRoll];
  return createIntervalExercise(
    {
      intervals: ["M3"],
      presentations: ["melodic-ascending", "melodic-descending", "harmonic"],
      playbackPattern: pattern,
      clef: "treble",
    },
    () => values[call++] ?? 0,
  );
}

test("ascending-then-descending plays ascending followed by descending to the start", () => {
  const exercise = makePatternExercise("ascending-then-descending", 0, 0);
  assert.equal(exercise.playbackPattern, "ascending-then-descending");
  assert.equal(exercise.presentation, "melodic-ascending");

  const events = getIntervalPlaybackEvents(exercise);
  assert.equal(events.length, 3);
  assert.deepEqual(events.map((event) => event.kind), [
    "melodic",
    "melodic",
    "melodic",
  ]);
  assert.deepEqual(
    events.map((event) => event.notes.map((note) => note.toneName)),
    [["C4"], ["E4"], ["C4"]],
  );
  assert.equal(
    getIntervalPlaybackLabel(exercise),
    "Ascending, then descending",
  );
  assert.equal(formatIntervalPlayback(exercise), "C4 → E4 → C4");
});

test("directional-then-harmonic plays a direction followed by the simultaneous chord", () => {
  const ascending = makePatternExercise("directional-then-harmonic", 0, 0);
  const descending = makePatternExercise("directional-then-harmonic", 0.6, 0);

  const ascEvents = getIntervalPlaybackEvents(ascending);
  const descEvents = getIntervalPlaybackEvents(descending);
  assert.deepEqual(
    ascEvents.map((event) => event.notes.map((note) => note.toneName)),
    [["C4"], ["E4"], ["C4", "E4"]],
  );
  assert.deepEqual(
    descEvents.map((event) => event.notes.map((note) => note.toneName)),
    [["E4"], ["C4"], ["C4", "E4"]],
  );

  // The harmonic event always plays both interval notes together, regardless
  // of which directional presentation was selected.
  const harmonicEvent = descEvents[2];
  assert.equal(harmonicEvent.kind, "harmonic");
  assert.deepEqual(
    [...harmonicEvent.notes].sort((a, b) => a.midi - b.midi),
    [descending.lowerNote, descending.upperNote],
  );

  assert.equal(
    getIntervalPlaybackLabel(ascending),
    "Directional, then harmonic",
  );
});

test("directional-only plays exactly one direction with no return or harmony", () => {
  const ascending = makePatternExercise("directional-only", 0, 0);
  const descending = makePatternExercise("directional-only", 0.6, 0);

  assert.deepEqual(
    getIntervalPlaybackEvents(ascending).map((event) => event.kind),
    ["melodic", "melodic"],
  );
  assert.deepEqual(
    getIntervalPlaybackEvents(ascending).map((event) => event.notes[0].toneName),
    ["C4", "E4"],
  );
  assert.deepEqual(
    getIntervalPlaybackEvents(descending).map(
      (event) => event.notes[0].toneName,
   ),
    ["E4", "C4"],
 );
  assert.equal(formatIntervalPlayback(ascending), "C4 → E4");
  assert.equal(formatIntervalPlayback(descending), "E4 → C4");
  assert.equal(getIntervalPlaybackLabel(ascending), "Single direction");
});

test("selected-presentation preserves a custom harmonic presentation", () => {
  const harmonic = createIntervalExercise(
    {
      intervals: ["M3"],
      presentations: ["harmonic"],
      playbackPattern: "selected-presentation",
      clef: "treble",
    },
    () => 0,
  );
  const events = getIntervalPlaybackEvents(harmonic);
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, "harmonic");
  assert.deepEqual(events[0].notes.map((note) => note.toneName), [
    "C4",
    "E4",
  ]);
  assert.equal(getIntervalPlaybackLabel(harmonic), "Harmonic");
});

test("playback is deterministic for a generated exercise", () => {
  const exercise = makePatternExercise("directional-then-harmonic", 0, 0);
  assert.deepEqual(
    getIntervalPlaybackEvents(exercise),
    getIntervalPlaybackEvents(exercise),
  );
});

test("interval playback plans preserve note durations, gaps, and chords", () => {
  const ascending = getIntervalPlaybackPlan(
    makePatternExercise("ascending-then-descending", 0, 0),
  );
  assert.deepEqual(
    ascending.events.map((event) => ({
      notes: event.pitches.map((pitch) => pitch.toneName),
      durationSeconds: event.durationSeconds,
    })),
    [
      { notes: ["C4"], durationSeconds: 0.42 },
      { notes: ["E4"], durationSeconds: 0.5 },
      { notes: ["C4"], durationSeconds: 0.5 },
    ],
  );
  assert.deepEqual(ascending.options, {
    startDelaySeconds: 0.03,
    gapBetweenEventsSeconds: 0.17,
    completionPaddingSeconds: 0.17,
  });
  assert.equal(
    getMusicPlaybackDurationMs(ascending.events, ascending.options),
    1960,
  );

  const directionalThenHarmonic = getIntervalPlaybackPlan(
    makePatternExercise("directional-then-harmonic", 0.6, 0),
  );
  assert.deepEqual(
    directionalThenHarmonic.events.map((event) =>
      event.pitches.map((pitch) => pitch.toneName),
    ),
    [["E4"], ["C4"], ["C4", "E4"]],
  );
  assert.equal(
    getMusicPlaybackDurationMs(
      directionalThenHarmonic.events,
      directionalThenHarmonic.options,
    ),
    2310,
  );

  const harmonic = getIntervalPlaybackPlan(
    makePatternExercise("selected-presentation", 0.9, 0),
  );
  assert.deepEqual(
    harmonic.events[0].pitches.map((pitch) => pitch.toneName),
    ["C4", "E4"],
  );
  assert.equal(
    getMusicPlaybackDurationMs(harmonic.events, harmonic.options),
    1050,
  );
});
