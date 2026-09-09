import type {
  AccidentalMode,
  GeneratedNote,
  MusicClef,
  MusicPitch,
  NoteAccidental,
  NoteLetter,
  NoteRange,
  NaturalPitchBoundary,
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

const SHARP_LETTERS = new Set<NoteLetter>(["C", "D", "F", "G", "A"]);
const FLAT_LETTERS = new Set<NoteLetter>(["D", "E", "G", "A", "B"]);

export const CLEF_SUPPORTED_RANGES: Record<MusicClef, NoteRange> = {
  treble: {
    min: { letter: "C", octave: 3 },
    max: { letter: "A", octave: 6 },
  },
  bass: {
    min: { letter: "E", octave: 1 },
    max: { letter: "C", octave: 5 },
  },
};

export type NoteGenerationConfig =
  | {
      clef: MusicClef;
      range: NoteRange;
      accidentalMode: AccidentalMode;
    }
  | {
      clef: "both";
      ranges: Record<MusicClef, NoteRange>;
      accidentalMode: AccidentalMode;
    };

export interface ConcreteNoteGenerationConfig {
  clef: MusicClef;
  range: NoteRange;
  accidentalMode: AccidentalMode;
}

export function naturalMidi({
  letter,
  octave,
}: NaturalPitchBoundary): number {
  return (octave + 1) * 12 + NATURAL_PITCH_CLASSES[letter];
}

export function createMusicPitch(
  letter: NoteLetter,
  octave: number,
  accidental: NoteAccidental,
): MusicPitch {
  const accidentalOffset =
    accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  const midi = naturalMidi({ letter, octave }) + accidentalOffset;

  return {
    letter,
    accidental,
    octave,
    midi,
    pitchClass: ((midi % 12) + 12) % 12,
    toneName: `${letter}${accidental}${octave}`,
    vexKey: `${letter.toLowerCase()}${accidental}/${octave}`,
  };
}

function accidentalsFor(
  letter: NoteLetter,
  mode: AccidentalMode,
): NoteAccidental[] {
  const accidentals: NoteAccidental[] = [""];

  if (
    (mode === "sharps" || mode === "sharps-and-flats") &&
    SHARP_LETTERS.has(letter)
  ) {
    accidentals.push("#");
  }

  if (
    (mode === "flats" || mode === "sharps-and-flats") &&
    FLAT_LETTERS.has(letter)
  ) {
    accidentals.push("b");
  }

  return accidentals;
}

function isNaturalPositionWithinRange(
  letter: NoteLetter,
  octave: number,
  range: NoteRange,
): boolean {
  const midi = naturalMidi({ letter, octave });
  return midi >= naturalMidi(range.min) && midi <= naturalMidi(range.max);
}

export function getNoteCandidates({
  clef,
  range,
  accidentalMode,
}: ConcreteNoteGenerationConfig): MusicPitch[] {
  const configuredMin = naturalMidi(range.min);
  const configuredMax = naturalMidi(range.max);
  const supportedRange = CLEF_SUPPORTED_RANGES[clef];
  const supportedMin = naturalMidi(supportedRange.min);
  const supportedMax = naturalMidi(supportedRange.max);
  const minMidi = Math.max(configuredMin, supportedMin);
  const maxMidi = Math.min(configuredMax, supportedMax);

  if (minMidi > maxMidi) return [];

  const candidates: MusicPitch[] = [];
  for (let octave = 0; octave <= 8; octave += 1) {
    for (const letter of LETTERS) {
      if (!isNaturalPositionWithinRange(letter, octave, range)) continue;
      if (
        !isNaturalPositionWithinRange(letter, octave, supportedRange)
      ) {
        continue;
      }

      for (const accidental of accidentalsFor(letter, accidentalMode)) {
        const pitch = createMusicPitch(letter, octave, accidental);
        if (pitch.midi >= minMidi && pitch.midi <= maxMidi) {
          candidates.push(pitch);
        }
      }
    }
  }

  return candidates;
}

function randomIndex(length: number, random: () => number): number {
  const roll = Math.max(0, Math.min(0.999999999, random()));
  return Math.floor(roll * length);
}

export function generateNote(
  config: NoteGenerationConfig,
  random: () => number = Math.random,
): GeneratedNote {
  const requestedClefs: readonly MusicClef[] =
    config.clef === "both" ? ["treble", "bass"] : [config.clef];
  const available = requestedClefs
    .map((clef) => ({
      clef,
      candidates: getNoteCandidates({
        clef,
        range: config.clef === "both" ? config.ranges[clef] : config.range,
        accidentalMode: config.accidentalMode,
      }),
    }))
    .filter((entry) => entry.candidates.length > 0);

  if (available.length === 0) {
    throw new Error("No notes are available for the selected configuration.");
  }

  const clefEntry = available[randomIndex(available.length, random)];
  const pitch =
    clefEntry.candidates[
      randomIndex(clefEntry.candidates.length, random)
    ];

  return { clef: clefEntry.clef, pitch };
}
