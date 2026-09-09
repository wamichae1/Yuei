import type {
  IntervalDefinition,
  IntervalExercise,
  IntervalId,
  IntervalPlaybackPattern,
  IntervalPresentation,
  IntervalTrainerConfig,
  MusicalNote,
  NoteAccidental,
  NoteLetter,
  ProductRcmLevelPreset,
  RcmLevel,
  ResolvedIntervalConfig,
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

const NATURAL_PITCH_CLASSES: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const LOWER_NOTE_CANDIDATES: readonly {
  letter: NoteLetter;
  octave: number;
}[] = [
  { letter: "C", octave: 4 },
  { letter: "D", octave: 4 },
  { letter: "E", octave: 4 },
  { letter: "F", octave: 4 },
  { letter: "G", octave: 4 },
  { letter: "A", octave: 4 },
  { letter: "B", octave: 4 },
  { letter: "C", octave: 5 },
];

export const INTERVAL_DEFINITIONS: Record<
  IntervalId,
  IntervalDefinition
> = {
  m2: {
    id: "m2",
    label: "Minor 2nd",
    shortLabel: "m2",
    semitones: 1,
    diatonicNumber: 2,
  },
  M2: {
    id: "M2",
    label: "Major 2nd",
    shortLabel: "M2",
    semitones: 2,
    diatonicNumber: 2,
  },
  m3: {
    id: "m3",
    label: "Minor 3rd",
    shortLabel: "m3",
    semitones: 3,
    diatonicNumber: 3,
  },
  M3: {
    id: "M3",
    label: "Major 3rd",
    shortLabel: "M3",
    semitones: 4,
    diatonicNumber: 3,
  },
  P4: {
    id: "P4",
    label: "Perfect 4th",
    shortLabel: "P4",
    semitones: 5,
    diatonicNumber: 4,
  },
  tritone: {
    id: "tritone",
    label: "Tritone",
    shortLabel: "TT",
    semitones: 6,
    diatonicNumber: 4,
  },
  P5: {
    id: "P5",
    label: "Perfect 5th",
    shortLabel: "P5",
    semitones: 7,
    diatonicNumber: 5,
  },
  m6: {
    id: "m6",
    label: "Minor 6th",
    shortLabel: "m6",
    semitones: 8,
    diatonicNumber: 6,
  },
  M6: {
    id: "M6",
    label: "Major 6th",
    shortLabel: "M6",
    semitones: 9,
    diatonicNumber: 6,
  },
  m7: {
    id: "m7",
    label: "Minor 7th",
    shortLabel: "m7",
    semitones: 10,
    diatonicNumber: 7,
  },
  M7: {
    id: "M7",
    label: "Major 7th",
    shortLabel: "M7",
    semitones: 11,
    diatonicNumber: 7,
  },
  P8: {
    id: "P8",
    label: "Perfect 8th",
    shortLabel: "P8",
    semitones: 12,
    diatonicNumber: 8,
  },
  m9: {
    id: "m9",
    label: "Minor 9th",
    shortLabel: "m9",
    semitones: 13,
    diatonicNumber: 9,
  },
  M9: {
    id: "M9",
    label: "Major 9th",
    shortLabel: "M9",
    semitones: 14,
    diatonicNumber: 9,
  },
};

export const INTERVAL_ORDER: readonly IntervalId[] = [
  "m2",
  "M2",
  "m3",
  "M3",
  "P4",
  "tritone",
  "P5",
  "m6",
  "M6",
  "m7",
  "M7",
  "P8",
  "m9",
  "M9",
];

export const PRESENTATION_LABELS: Record<
  IntervalPresentation,
  string
> = {
  "melodic-ascending": "Melodic ascending",
  "melodic-descending": "Melodic descending",
  harmonic: "Harmonic",
};

const MELODIC_PRESENTATIONS = [
  "melodic-ascending",
  "melodic-descending",
] as const satisfies readonly IntervalPresentation[];

interface IntervalPlaybackPatternConfig {
  label: string;
  presentations: readonly IntervalPresentation[] | null;
}

/**
 * Centralized level playback behavior. A null presentation list means the
 * custom setup's selected presentations should be used unchanged.
 */
export const INTERVAL_PLAYBACK_PATTERN_CONFIG: Record<
  IntervalPlaybackPattern,
  IntervalPlaybackPatternConfig
> = {
  "ascending-then-descending": {
    label: "Ascending, then descending",
    presentations: ["melodic-ascending"],
  },
  "directional-then-harmonic": {
    label: "Directional, then harmonic",
    presentations: MELODIC_PRESENTATIONS,
  },
  "directional-only": {
    label: "Single direction",
    presentations: MELODIC_PRESENTATIONS,
  },
  "selected-presentation": {
    label: "Selected presentation",
    presentations: null,
  },
};

/**
 * Product-defined "RCM Level" presets supplied for this application.
 * These are product requirements, not a representation or verification of
 * any external or official curriculum.
 */
export const PRODUCT_RCM_LEVEL_PRESETS: Record<
  RcmLevel,
  ProductRcmLevelPreset
> = {
  1: {
    level: 1,
    label: "RCM Level 1",
    intervals: ["M3", "m3"],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "ascending-then-descending",
  },
  2: {
    level: 2,
    label: "RCM Level 2",
    intervals: ["M3", "m3", "P5"],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "ascending-then-descending",
  },
  3: {
    level: 3,
    label: "RCM Level 3",
    intervals: ["M3", "m3", "P5", "P4"],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "ascending-then-descending",
  },
  4: {
    level: 4,
    label: "RCM Level 4",
    intervals: ["M3", "m3", "P5", "P4", "P8"],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "ascending-then-descending",
  },
  5: {
    level: 5,
    label: "RCM Level 5",
    intervals: ["M3", "m3", "P5", "P4", "P8", "M6", "m6"],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-then-harmonic",
  },
  6: {
    level: 6,
    label: "RCM Level 6",
    intervals: [
      "M3",
      "m3",
      "P5",
      "P4",
      "P8",
      "M6",
      "m6",
      "M2",
      "m2",
    ],
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-then-harmonic",
  },
  7: {
    level: 7,
    label: "RCM Level 7",
    intervals: [
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
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-then-harmonic",
  },
  8: {
    level: 8,
    label: "RCM Level 8",
    intervals: [
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
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-then-harmonic",
  },
  9: {
    level: 9,
    label: "RCM Level 9",
    intervals: [
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
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-then-harmonic",
  },
  10: {
    level: 10,
    label: "RCM Level 10",
    intervals: [
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
    presentations: MELODIC_PRESENTATIONS,
    playbackPattern: "directional-only",
  },
};

export function sortIntervalIds(
  intervals: readonly IntervalId[],
): IntervalId[] {
  const selected = new Set(intervals);
  return INTERVAL_ORDER.filter((interval) => selected.has(interval));
}

export function resolveIntervalConfig(
  config: IntervalTrainerConfig,
): ResolvedIntervalConfig {
  const source =
    config.setupMode === "rcm"
      ? PRODUCT_RCM_LEVEL_PRESETS[config.rcmLevel]
      : config.custom;
  const playbackPattern =
    config.setupMode === "rcm"
      ? PRODUCT_RCM_LEVEL_PRESETS[config.rcmLevel].playbackPattern
      : "selected-presentation";

  return {
    intervals: sortIntervalIds(source.intervals),
    presentations: [...source.presentations],
    playbackPattern,
    clef: "treble",
  };
}

export function isCustomConfigValid(
  config: IntervalTrainerConfig,
): boolean {
  return (
    config.custom.intervals.length > 0 &&
    config.custom.presentations.length > 0
  );
}

function naturalMidi(letter: NoteLetter, octave: number): number {
  return (octave + 1) * 12 + NATURAL_PITCH_CLASSES[letter];
}

function accidentalFromOffset(offset: number): NoteAccidental {
  if (offset === -1) return "b";
  if (offset === 0) return "";
  if (offset === 1) return "#";
  throw new Error(`Unsupported accidental offset: ${offset}`);
}

function createNote(
  letter: NoteLetter,
  octave: number,
  accidental: NoteAccidental,
): MusicalNote {
  const accidentalOffset =
    accidental === "#" ? 1 : accidental === "b" ? -1 : 0;

  return {
    letter,
    accidental,
    octave,
    midi: naturalMidi(letter, octave) + accidentalOffset,
    toneName: `${letter}${accidental}${octave}`,
    vexKey: `${letter.toLowerCase()}${accidental}/${octave}`,
  };
}

function createSpelledInterval(
  definition: IntervalDefinition,
  lowerLetter: NoteLetter,
  lowerOctave: number,
): readonly [MusicalNote, MusicalNote] {
  const lowerNote = createNote(lowerLetter, lowerOctave, "");
  const lowerLetterIndex = LETTERS.indexOf(lowerLetter);
  const targetLetterOffset =
    lowerLetterIndex + definition.diatonicNumber - 1;
  const upperLetter = LETTERS[targetLetterOffset % LETTERS.length];
  const upperOctave =
    lowerOctave + Math.floor(targetLetterOffset / LETTERS.length);
  const desiredUpperMidi = lowerNote.midi + definition.semitones;
  const accidental = accidentalFromOffset(
    desiredUpperMidi - naturalMidi(upperLetter, upperOctave),
  );
  const upperNote = createNote(upperLetter, upperOctave, accidental);

  return [lowerNote, upperNote];
}

function randomItem<T>(
  items: readonly T[],
  random: () => number,
): T {
  return items[Math.floor(random() * items.length)];
}

export function createIntervalExercise(
  config: ResolvedIntervalConfig,
  random: () => number = Math.random,
): IntervalExercise {
  if (config.intervals.length === 0 || config.presentations.length === 0) {
    throw new Error("Interval exercises require intervals and presentations.");
  }

  const intervalId = randomItem(config.intervals, random);
  const definition = INTERVAL_DEFINITIONS[intervalId];
  const playbackPattern =
    INTERVAL_PLAYBACK_PATTERN_CONFIG[config.playbackPattern];
  const presentation = randomItem(
    playbackPattern.presentations ?? config.presentations,
    random,
  );
  const root = randomItem(LOWER_NOTE_CANDIDATES, random);
  const [lowerNote, upperNote] = createSpelledInterval(
    definition,
    root.letter,
    root.octave,
  );
  const notes =
    presentation === "melodic-descending"
      ? ([upperNote, lowerNote] as const)
      : ([lowerNote, upperNote] as const);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    trainingType: "intervals",
    intervalId,
    presentation,
    playbackPattern: config.playbackPattern,
    notes,
    lowerNote,
    upperNote,
  };
}
