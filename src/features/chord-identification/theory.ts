import {
  createMusicPitch,
  naturalMidi,
} from "../music/noteGenerator.ts";
import { isPianoMidiCovered } from "../music/pianoSamples.ts";
import type {
  MusicPitch,
  NoteAccidental,
  NoteLetter,
} from "../music/types.ts";

import type {
  ChordAnswerId,
  ChordExerciseConfig,
  ChordIdentificationExercise,
  ChordInversion,
  ChordOptionConfig,
  ChordRcmLevel,
  ChordRcmLevelConfig,
  ChordToneId,
  ChordTypeId,
} from "./types";

interface ChordToneDefinition {
  role: ChordToneId | "seventh";
  semitones: number;
  diatonicSteps: number;
}

export interface ChordDefinition {
  id: ChordTypeId;
  label: string;
  shortLabel: string;
  tones: readonly ChordToneDefinition[];
  voiceCount: 3 | 4;
}

export const CHORD_DEFINITIONS: Record<ChordTypeId, ChordDefinition> = {
  "major-triad": {
    id: "major-triad",
    label: "Major triad",
    shortLabel: "Major",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 4, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
    ],
    voiceCount: 3,
  },
  "minor-triad": {
    id: "minor-triad",
    label: "Minor triad",
    shortLabel: "Minor",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 3, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
    ],
    voiceCount: 3,
  },
  "augmented-triad": {
    id: "augmented-triad",
    label: "Augmented triad",
    shortLabel: "Augmented",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 4, diatonicSteps: 2 },
      { role: "fifth", semitones: 8, diatonicSteps: 4 },
    ],
    voiceCount: 3,
  },
  "dominant-seventh": {
    id: "dominant-seventh",
    label: "Dominant 7th",
    shortLabel: "Dominant 7th",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 4, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
      { role: "seventh", semitones: 10, diatonicSteps: 6 },
    ],
    voiceCount: 4,
  },
  "diminished-seventh": {
    id: "diminished-seventh",
    label: "Diminished 7th",
    shortLabel: "Diminished 7th",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 3, diatonicSteps: 2 },
      { role: "fifth", semitones: 6, diatonicSteps: 4 },
      { role: "seventh", semitones: 9, diatonicSteps: 6 },
    ],
    voiceCount: 4,
  },
  "major-four-note": {
    id: "major-four-note",
    label: "Major four-note chord",
    shortLabel: "Major 4-note",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 4, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
    ],
    voiceCount: 4,
  },
  "minor-four-note": {
    id: "minor-four-note",
    label: "Minor four-note chord",
    shortLabel: "Minor 4-note",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 3, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
    ],
    voiceCount: 4,
  },
  "major-seventh": {
    id: "major-seventh",
    label: "Major 7th",
    shortLabel: "Major 7th",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 4, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
      { role: "seventh", semitones: 11, diatonicSteps: 6 },
    ],
    voiceCount: 4,
  },
  "minor-seventh": {
    id: "minor-seventh",
    label: "Minor 7th",
    shortLabel: "Minor 7th",
    tones: [
      { role: "root", semitones: 0, diatonicSteps: 0 },
      { role: "third", semitones: 3, diatonicSteps: 2 },
      { role: "fifth", semitones: 7, diatonicSteps: 4 },
      { role: "seventh", semitones: 10, diatonicSteps: 6 },
    ],
    voiceCount: 4,
  },
};

export const CHORD_TONE_LABELS: Record<ChordToneId, string> = {
  root: "Root",
  third: "3rd",
  fifth: "5th",
};

export const INVERSION_LABELS: Record<ChordInversion, string> = {
  root: "Root position",
  first: "1st inversion",
};

const ROOT_ONLY = ["root"] as const;
const ROOT_OR_FIRST = ["root", "first"] as const;
const TONE_ANSWERS = ["root", "third", "fifth"] as const;

function chordOption(
  chordType: ChordTypeId,
  inversions: readonly ChordInversion[] = ROOT_ONLY,
): ChordOptionConfig {
  return { chordType, inversions };
}

function qualityConfig(
  chordOptions: readonly ChordOptionConfig[],
  playbackPattern: "blocked" | "broken-then-blocked" = "blocked",
): ChordExerciseConfig {
  return {
    type: "quality",
    chordOptions,
    playbackPattern,
    answerChoices: chordOptions.map((option) => option.chordType),
  };
}

const MAJOR_MINOR_OPTIONS = [
  chordOption("major-triad"),
  chordOption("minor-triad"),
] as const;

const TONE_CONFIG: ChordExerciseConfig = {
  type: "tone",
  chordOptions: MAJOR_MINOR_OPTIONS,
  playbackPattern: "broken-then-target",
  answerChoices: TONE_ANSWERS,
};

export const RCM_CHORD_IDENTIFICATION_CONFIG: Record<
  ChordRcmLevel,
  ChordRcmLevelConfig
> = {
  1: {
    level: 1,
    label: "RCM Level 1",
    exerciseTypes: [
      qualityConfig(MAJOR_MINOR_OPTIONS, "broken-then-blocked"),
    ],
  },
  2: {
    level: 2,
    label: "RCM Level 2",
    exerciseTypes: [qualityConfig(MAJOR_MINOR_OPTIONS)],
  },
  3: {
    level: 3,
    label: "RCM Level 3",
    exerciseTypes: [qualityConfig(MAJOR_MINOR_OPTIONS), TONE_CONFIG],
  },
  4: {
    level: 4,
    label: "RCM Level 4",
    exerciseTypes: [qualityConfig(MAJOR_MINOR_OPTIONS), TONE_CONFIG],
  },
  5: {
    level: 5,
    label: "RCM Level 5",
    exerciseTypes: [
      qualityConfig([
        ...MAJOR_MINOR_OPTIONS,
        chordOption("dominant-seventh"),
      ]),
    ],
  },
  6: {
    level: 6,
    label: "RCM Level 6",
    exerciseTypes: [
      qualityConfig([
        ...MAJOR_MINOR_OPTIONS,
        chordOption("dominant-seventh"),
        chordOption("diminished-seventh"),
      ]),
    ],
  },
  7: {
    level: 7,
    label: "RCM Level 7",
    exerciseTypes: [
      qualityConfig([
        ...MAJOR_MINOR_OPTIONS,
        chordOption("augmented-triad"),
        chordOption("dominant-seventh"),
        chordOption("diminished-seventh"),
      ]),
    ],
  },
  8: {
    level: 8,
    label: "RCM Level 8",
    exerciseTypes: [
      qualityConfig([
        ...MAJOR_MINOR_OPTIONS,
        chordOption("augmented-triad"),
        chordOption("dominant-seventh"),
        chordOption("diminished-seventh"),
      ]),
    ],
  },
  9: {
    level: 9,
    label: "RCM Level 9",
    exerciseTypes: [
      qualityConfig([
        chordOption("major-four-note", ROOT_OR_FIRST),
        chordOption("minor-four-note", ROOT_OR_FIRST),
        chordOption("augmented-triad"),
        chordOption("dominant-seventh"),
        chordOption("diminished-seventh"),
      ]),
    ],
  },
  10: {
    level: 10,
    label: "RCM Level 10",
    exerciseTypes: [
      qualityConfig([
        chordOption("major-four-note", ROOT_OR_FIRST),
        chordOption("minor-four-note", ROOT_OR_FIRST),
        chordOption("augmented-triad"),
        chordOption("dominant-seventh"),
        chordOption("diminished-seventh"),
        chordOption("major-seventh"),
        chordOption("minor-seventh"),
      ]),
    ],
  },
};

const LETTERS: readonly NoteLetter[] = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "B",
];

const ROOT_SPELLINGS: Record<
  number,
  readonly { letter: NoteLetter; accidental: NoteAccidental }[]
> = {
  0: [
    { letter: "C", accidental: "" },
    { letter: "B", accidental: "#" },
  ],
  1: [
    { letter: "C", accidental: "#" },
    { letter: "D", accidental: "b" },
  ],
  2: [{ letter: "D", accidental: "" }],
  3: [
    { letter: "E", accidental: "b" },
    { letter: "D", accidental: "#" },
  ],
  4: [
    { letter: "E", accidental: "" },
    { letter: "F", accidental: "b" },
  ],
  5: [
    { letter: "F", accidental: "" },
    { letter: "E", accidental: "#" },
  ],
  6: [
    { letter: "F", accidental: "#" },
    { letter: "G", accidental: "b" },
  ],
  7: [{ letter: "G", accidental: "" }],
  8: [
    { letter: "A", accidental: "b" },
    { letter: "G", accidental: "#" },
  ],
  9: [{ letter: "A", accidental: "" }],
  10: [
    { letter: "B", accidental: "b" },
    { letter: "A", accidental: "#" },
  ],
  11: [
    { letter: "B", accidental: "" },
    { letter: "C", accidental: "b" },
  ],
};

interface VoicedPitch {
  pitch: MusicPitch;
  role: ChordToneDefinition["role"];
}

function accidentalFromOffset(offset: number): NoteAccidental | null {
  if (offset === -1) return "b";
  if (offset === 0) return "";
  if (offset === 1) return "#";
  return null;
}

function rootPitchForClass(
  pitchClass: number,
  letter: NoteLetter,
  accidental: NoteAccidental,
): MusicPitch | null {
  const targetMidi = 60 + pitchClass;
  for (let octave = 3; octave <= 5; octave += 1) {
    const pitch = createMusicPitch(letter, octave, accidental);
    if (pitch.midi === targetMidi) return pitch;
  }
  return null;
}

function tryBuildVoicing(
  definition: ChordDefinition,
  inversion: ChordInversion,
  root: MusicPitch,
): VoicedPitch[] | null {
  const startToneIndex = inversion === "first" ? 1 : 0;
  const rootLetterIndex = LETTERS.indexOf(root.letter);
  const voiced: VoicedPitch[] = [];

  for (let voiceIndex = 0; voiceIndex < definition.voiceCount; voiceIndex += 1) {
    const absoluteToneIndex = startToneIndex + voiceIndex;
    const toneIndex = absoluteToneIndex % definition.tones.length;
    const wraps = Math.floor(absoluteToneIndex / definition.tones.length);
    const tone = definition.tones[toneIndex];
    const absoluteLetterIndex =
      rootLetterIndex + tone.diatonicSteps + wraps * LETTERS.length;
    const letter = LETTERS[absoluteLetterIndex % LETTERS.length];
    const octave =
      root.octave + Math.floor(absoluteLetterIndex / LETTERS.length);
    const desiredMidi = root.midi + tone.semitones + wraps * 12;
    const accidental = accidentalFromOffset(
      desiredMidi - naturalMidi({ letter, octave }),
    );

    if (accidental === null) return null;
    const pitch = createMusicPitch(letter, octave, accidental);
    if (!isPianoMidiCovered(pitch.midi)) return null;
    voiced.push({ pitch, role: tone.role });
  }

  return voiced;
}

export function createChordVoicing(
  chordType: ChordTypeId,
  inversion: ChordInversion,
  rootPitchClass: number,
): VoicedPitch[] {
  const definition = CHORD_DEFINITIONS[chordType];
  const spellings = ROOT_SPELLINGS[rootPitchClass];
  if (!spellings) {
    throw new Error(`Unsupported root pitch class: ${rootPitchClass}`);
  }

  for (const spelling of spellings) {
    const root = rootPitchForClass(
      rootPitchClass,
      spelling.letter,
      spelling.accidental,
    );
    if (!root) continue;
    const voicing = tryBuildVoicing(definition, inversion, root);
    if (voicing) return voicing;
  }

  throw new Error(
    `No supported spelling for ${chordType} on pitch class ${rootPitchClass}.`,
  );
}

function randomItem<T>(items: readonly T[], random: () => number): T {
  const roll = Math.max(0, Math.min(0.999999999, random()));
  return items[Math.floor(roll * items.length)];
}

export function createChordIdentificationExercise(
  level: ChordRcmLevel,
  random: () => number = Math.random,
): ChordIdentificationExercise {
  const levelConfig = RCM_CHORD_IDENTIFICATION_CONFIG[level];
  const exerciseConfig = randomItem(levelConfig.exerciseTypes, random);
  const chordOption = randomItem(exerciseConfig.chordOptions, random);
  const inversion = randomItem(chordOption.inversions, random);
  const rootPitchClass = Math.floor(
    Math.max(0, Math.min(0.999999999, random())) * 12,
  );
  const voiced = createChordVoicing(
    chordOption.chordType,
    inversion,
    rootPitchClass,
  );
  const chordNotes = voiced.map(({ pitch }) => pitch);
  const base = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    trainingType: "chord-identification" as const,
    level,
    chordType: chordOption.chordType,
    inversion,
    playbackPattern: exerciseConfig.playbackPattern,
    chordNotes,
  };

  if (exerciseConfig.type === "quality") {
    return {
      ...base,
      exerciseType: "quality",
      answerChoices: exerciseConfig.answerChoices,
      correctAnswer: chordOption.chordType,
    };
  }

  const targetTone = randomItem(exerciseConfig.answerChoices, random);
  const target = voiced.find(({ role }) => role === targetTone);
  if (!target) {
    throw new Error(
      `${chordOption.chordType} does not contain a ${targetTone}.`,
    );
  }

  return {
    ...base,
    exerciseType: "tone",
    answerChoices: exerciseConfig.answerChoices,
    targetTone,
    targetNote: target.pitch,
    correctAnswer: targetTone,
  };
}

export function isChordAnswerCorrect(
  exercise: ChordIdentificationExercise,
  answer: ChordAnswerId,
): boolean {
  return exercise.correctAnswer === answer;
}

export function getChordAnswerLabel(answer: ChordAnswerId): string {
  if (answer === "root" || answer === "third" || answer === "fifth") {
    return CHORD_TONE_LABELS[answer];
  }
  return CHORD_DEFINITIONS[answer].shortLabel;
}

export function getExerciseTypeLabel(
  exerciseConfig: ChordExerciseConfig,
): string {
  return exerciseConfig.type === "quality"
    ? "Chord quality"
    : "Chord tone";
}
