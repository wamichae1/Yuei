import type { SessionModeId } from "@/features/training/session";
import type { TrainingExercise } from "@/features/training/types";

export type Clef = "treble";

export type IntervalId =
  | "m2"
  | "M2"
  | "m3"
  | "M3"
  | "P4"
  | "tritone"
  | "P5"
  | "m6"
  | "M6"
  | "m7"
  | "M7"
  | "P8"
  | "m9"
  | "M9";

export type IntervalPresentation =
  | "melodic-ascending"
  | "melodic-descending"
  | "harmonic";

export type IntervalPlaybackPattern =
  | "ascending-then-descending"
  | "directional-then-harmonic"
  | "directional-only"
  | "selected-presentation";

export type RcmLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type IntervalSetupMode = "rcm" | "custom";

export interface CustomIntervalConfig {
  intervals: IntervalId[];
  presentations: IntervalPresentation[];
}

export interface IntervalTrainerConfig {
  setupMode: IntervalSetupMode;
  rcmLevel: RcmLevel;
  custom: CustomIntervalConfig;
  sessionModeId: SessionModeId;
}

export interface ResolvedIntervalConfig {
  intervals: readonly IntervalId[];
  presentations: readonly IntervalPresentation[];
  playbackPattern: IntervalPlaybackPattern;
  clef: Clef;
}

export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type NoteAccidental = "" | "#" | "b";

export interface MusicalNote {
  letter: NoteLetter;
  accidental: NoteAccidental;
  octave: number;
  midi: number;
  toneName: string;
  vexKey: string;
}

export interface IntervalExercise extends TrainingExercise {
  trainingType: "intervals";
  intervalId: IntervalId;
  presentation: IntervalPresentation;
  playbackPattern: IntervalPlaybackPattern;
  notes: readonly [MusicalNote, MusicalNote];
  lowerNote: MusicalNote;
  upperNote: MusicalNote;
}

export interface IntervalDefinition {
  id: IntervalId;
  label: string;
  shortLabel: string;
  semitones: number;
  diatonicNumber: number;
}

export interface ProductRcmLevelPreset {
  level: RcmLevel;
  label: string;
  intervals: readonly IntervalId[];
  presentations: readonly IntervalPresentation[];
  playbackPattern: IntervalPlaybackPattern;
}
