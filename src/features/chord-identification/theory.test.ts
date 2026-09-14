import assert from "node:assert/strict";
import test from "node:test";

import { getMusicPlaybackDurationMs } from "../music/audio.ts";
import { isPianoMidiCovered } from "../music/pianoSamples.ts";
import {
  formatChordPlayback,
  getChordPlaybackPlan,
} from "./playback.ts";
import { buildChordBreakdown } from "./results.ts";
import {
  CHORD_DEFINITIONS,
  createChordIdentificationExercise,
  createChordVoicing,
  isChordAnswerCorrect,
  RCM_CHORD_IDENTIFICATION_CONFIG,
} from "./theory.ts";
import type {
  ChordAnswerId,
  ChordIdentificationExercise,
  ChordInversion,
  ChordRcmLevel,
  ChordTypeId,
} from "./types.ts";

const EXPECTED_LEVELS: Record<
  ChordRcmLevel,
  readonly {
    type: "quality" | "tone";
    chords: readonly ChordTypeId[];
    playback:
      | "blocked"
      | "broken-then-blocked"
      | "broken-then-target";
    answers: readonly ChordAnswerId[];
  }[]
> = {
  1: [
    {
      type: "quality",
      chords: ["major-triad", "minor-triad"],
      playback: "broken-then-blocked",
      answers: ["major-triad", "minor-triad"],
    },
  ],
  2: [
    {
      type: "quality",
      chords: ["major-triad", "minor-triad"],
      playback: "blocked",
      answers: ["major-triad", "minor-triad"],
    },
  ],
  3: [
    {
      type: "quality",
      chords: ["major-triad", "minor-triad"],
      playback: "blocked",
      answers: ["major-triad", "minor-triad"],
    },
    {
      type: "tone",
      chords: ["major-triad", "minor-triad"],
      playback: "broken-then-target",
      answers: ["root", "third", "fifth"],
    },
  ],
  4: [
    {
      type: "quality",
      chords: ["major-triad", "minor-triad"],
      playback: "blocked",
      answers: ["major-triad", "minor-triad"],
    },
    {
      type: "tone",
      chords: ["major-triad", "minor-triad"],
      playback: "broken-then-target",
      answers: ["root", "third", "fifth"],
    },
  ],
  5: [
    {
      type: "quality",
      chords: ["major-triad", "minor-triad", "dominant-seventh"],
      playback: "blocked",
      answers: ["major-triad", "minor-triad", "dominant-seventh"],
    },
  ],
  6: [
    {
      type: "quality",
      chords: [
        "major-triad",
        "minor-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
      playback: "blocked",
      answers: [
        "major-triad",
        "minor-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
    },
  ],
  7: [
    {
      type: "quality",
      chords: [
        "major-triad",
        "minor-triad",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
      playback: "blocked",
      answers: [
        "major-triad",
        "minor-triad",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
    },
  ],
  8: [
    {
      type: "quality",
      chords: [
        "major-triad",
        "minor-triad",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
      playback: "blocked",
      answers: [
        "major-triad",
        "minor-triad",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
    },
  ],
  9: [
    {
      type: "quality",
      chords: [
        "major-four-note",
        "minor-four-note",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
      playback: "blocked",
      answers: [
        "major-four-note",
        "minor-four-note",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
      ],
    },
  ],
  10: [
    {
      type: "quality",
      chords: [
        "major-four-note",
        "minor-four-note",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
        "major-seventh",
        "minor-seventh",
      ],
      playback: "blocked",
      answers: [
        "major-four-note",
        "minor-four-note",
        "augmented-triad",
        "dominant-seventh",
        "diminished-seventh",
        "major-seventh",
        "minor-seventh",
      ],
    },
  ],
};

function sequenceRandom(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

test("RCM chord configuration exactly matches Levels 1 through 10", () => {
  for (let level = 1; level <= 10; level += 1) {
    const typedLevel = level as ChordRcmLevel;
    const actual =
      RCM_CHORD_IDENTIFICATION_CONFIG[typedLevel].exerciseTypes.map(
        (exercise) => ({
          type: exercise.type,
          chords: exercise.chordOptions.map((option) => option.chordType),
          playback: exercise.playbackPattern,
          answers: exercise.answerChoices,
        }),
      );
    assert.deepEqual(actual, EXPECTED_LEVELS[typedLevel]);
  }
});

test("only Level 9 and 10 major/minor four-note chords allow first inversion", () => {
  for (let level = 1; level <= 10; level += 1) {
    const typedLevel = level as ChordRcmLevel;
    for (const exercise of RCM_CHORD_IDENTIFICATION_CONFIG[typedLevel]
      .exerciseTypes) {
      for (const option of exercise.chordOptions) {
        const shouldAllowFirst =
          level >= 9 &&
          (option.chordType === "major-four-note" ||
            option.chordType === "minor-four-note");
        assert.equal(
          option.inversions.includes("first"),
          shouldAllowFirst,
          `Level ${level} / ${option.chordType}`,
        );
      }
    }
  }
});

test("every supported chord and inversion produces ascending covered pitches for all chromatic roots", () => {
  const supported: readonly [ChordTypeId, ChordInversion][] = [
    ["major-triad", "root"],
    ["minor-triad", "root"],
    ["augmented-triad", "root"],
    ["dominant-seventh", "root"],
    ["diminished-seventh", "root"],
    ["major-four-note", "root"],
    ["major-four-note", "first"],
    ["minor-four-note", "root"],
    ["minor-four-note", "first"],
    ["major-seventh", "root"],
    ["minor-seventh", "root"],
  ];

  for (const [chordType, inversion] of supported) {
    for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
      const voiced = createChordVoicing(
        chordType,
        inversion,
        pitchClass,
      );
      const notes = voiced.map(({ pitch }) => pitch);
      assert.equal(
        notes.length,
        CHORD_DEFINITIONS[chordType].voiceCount,
      );
      assert.ok(notes.every((note) => isPianoMidiCovered(note.midi)));
      assert.ok(
        notes.every(
          (note, index) => index === 0 || note.midi > notes[index - 1].midi,
        ),
        `${chordType}/${inversion}/${pitchClass} was not ascending`,
      );
      assert.ok(
        notes.every((note) => ["", "#", "b"].includes(note.accidental)),
      );
    }
  }
});

test("major and minor four-note chords use the selected cyclic voicings", () => {
  const midiIntervals = (
    chordType: "major-four-note" | "minor-four-note",
    inversion: ChordInversion,
  ) => {
    const notes = createChordVoicing(chordType, inversion, 0).map(
      ({ pitch }) => pitch.midi,
    );
    return notes.map((midi) => midi - notes[0]);
  };

  assert.deepEqual(midiIntervals("major-four-note", "root"), [
    0, 4, 7, 12,
  ]);
  assert.deepEqual(midiIntervals("major-four-note", "first"), [
    0, 3, 8, 12,
  ]);
  assert.deepEqual(midiIntervals("minor-four-note", "root"), [
    0, 3, 7, 12,
  ]);
  assert.deepEqual(midiIntervals("minor-four-note", "first"), [
    0, 4, 9, 12,
  ]);
});

test("Level 1 plays the broken triad followed by the same blocked chord", () => {
  const exercise = createChordIdentificationExercise(
    1,
    sequenceRandom([0, 0, 0, 0]),
  );
  const plan = getChordPlaybackPlan(exercise);

  assert.equal(exercise.chordType, "major-triad");
  assert.equal(exercise.inversion, "root");
  assert.deepEqual(
    plan.events.map((event) =>
      event.pitches.map((pitch) => pitch.toneName),
    ),
    [["C4"], ["E4"], ["G4"], ["C4", "E4", "G4"]],
  );
  assert.equal(formatChordPlayback(exercise), "C4 → E4 → G4 → C4+E4+G4");
  assert.equal(
    getMusicPlaybackDurationMs(plan.events, plan.options),
    2960,
  );
});

test("Levels 3 and 4 can generate quality and chord-tone exercises", () => {
  for (const level of [3, 4] as const) {
    const quality = createChordIdentificationExercise(
      level,
      sequenceRandom([0.1, 0, 0, 0]),
    );
    const tone = createChordIdentificationExercise(
      level,
      sequenceRandom([0.9, 0, 0, 0, 0.9]),
    );

    assert.equal(quality.exerciseType, "quality");
    assert.equal(tone.exerciseType, "tone");
    assert.deepEqual(tone.answerChoices, ["root", "third", "fifth"]);
    if (tone.exerciseType === "tone") {
      assert.equal(tone.targetTone, "fifth");
      assert.equal(tone.targetNote, tone.chordNotes[2]);
      const events = getChordPlaybackPlan(tone).events;
      assert.deepEqual(
        events.at(-1)?.pitches.map((pitch) => pitch.toneName),
        [tone.targetNote.toneName],
      );
    }
  }
});

test("Levels 5 through 8 generate root-position chords only", () => {
  for (const level of [5, 6, 7, 8] as const) {
    const options =
      RCM_CHORD_IDENTIFICATION_CONFIG[level].exerciseTypes[0]
        .chordOptions;
    for (let index = 0; index < options.length; index += 1) {
      const exercise = createChordIdentificationExercise(
        level,
        sequenceRandom([
          0,
          (index + 0.1) / options.length,
          0.9,
          0,
        ]),
      );
      assert.equal(exercise.chordType, options[index].chordType);
      assert.equal(exercise.inversion, "root");
    }
  }
});

test("Levels 9 and 10 randomize inversion only for major/minor four-note chords", () => {
  for (const level of [9, 10] as const) {
    const options =
      RCM_CHORD_IDENTIFICATION_CONFIG[level].exerciseTypes[0]
        .chordOptions;
    for (let index = 0; index < options.length; index += 1) {
      const exercise = createChordIdentificationExercise(
        level,
        sequenceRandom([
          0,
          (index + 0.1) / options.length,
          0.9,
          0,
        ]),
      );
      const inversionAllowed = options[index].inversions.includes("first");
      assert.equal(
        exercise.inversion,
        inversionAllowed ? "first" : "root",
      );
    }
  }
});

test("answer validation and mixed results use each exercise's answer category", () => {
  const quality = createChordIdentificationExercise(
    2,
    sequenceRandom([0, 0, 0, 0]),
  );
  const tone = createChordIdentificationExercise(
    3,
    sequenceRandom([0.9, 0, 0, 0, 0]),
  );

  assert.equal(isChordAnswerCorrect(quality, "major-triad"), true);
  assert.equal(isChordAnswerCorrect(quality, "minor-triad"), false);
  assert.equal(isChordAnswerCorrect(tone, "root"), true);
  assert.equal(isChordAnswerCorrect(tone, "third"), false);

  const now = Date.now();
  const attempts = [
    {
      exercise: quality,
      answer: "major-triad" as ChordAnswerId,
      correct: true,
      startedAtMs: now,
      answeredAtMs: now,
    },
    {
      exercise: tone,
      answer: "third" as ChordAnswerId,
      correct: false,
      startedAtMs: now,
      answeredAtMs: now,
    },
  ];
  assert.deepEqual(
    buildChordBreakdown(attempts).map((row) => ({
      id: row.answerId,
      score: `${row.correct}/${row.attempted}`,
    })),
    [
      { id: "root", score: "0/1" },
      { id: "major-triad", score: "1/1" },
    ],
  );
});

test("playback plans are deterministic for an immutable exercise", () => {
  const exercise: ChordIdentificationExercise =
    createChordIdentificationExercise(
      10,
      sequenceRandom([0, 0.2, 0.9, 0.5]),
    );
  assert.deepEqual(
    getChordPlaybackPlan(exercise),
    getChordPlaybackPlan(exercise),
  );
});
