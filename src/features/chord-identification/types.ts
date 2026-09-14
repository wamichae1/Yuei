import type { MusicPitch } from "@/features/music/types";
import type { SessionModeId } from "@/features/training/session";
import type { TrainingExercise } from "@/features/training/types";

export type ChordRcmLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ChordExerciseType = "quality" | "tone";
export type ChordInversion = "root" | "first";
export type ChordPlaybackPattern =
  | "blocked"
  | "broken-then-blocked"
  | "broken-then-target";

export type ChordTypeId =
  | "major-triad"
  | "minor-triad"
  | "augmented-triad"
  | "dominant-seventh"
  | "diminished-seventh"
  | "major-four-note"
  | "minor-four-note"
  | "major-seventh"
  | "minor-seventh";

export type ChordToneId = "root" | "third" | "fifth";
export type ChordAnswerId = ChordTypeId | ChordToneId;

export interface ChordIdentificationConfig {
  rcmLevel: ChordRcmLevel;
  sessionModeId: SessionModeId;
}

export interface ChordOptionConfig {
  chordType: ChordTypeId;
  inversions: readonly ChordInversion[];
}

export interface ChordQualityExerciseConfig {
  type: "quality";
  chordOptions: readonly ChordOptionConfig[];
  playbackPattern: "blocked" | "broken-then-blocked";
  answerChoices: readonly ChordTypeId[];
}

export interface ChordToneExerciseConfig {
  type: "tone";
  chordOptions: readonly ChordOptionConfig[];
  playbackPattern: "broken-then-target";
  answerChoices: readonly ChordToneId[];
}

export type ChordExerciseConfig =
  | ChordQualityExerciseConfig
  | ChordToneExerciseConfig;

export interface ChordRcmLevelConfig {
  level: ChordRcmLevel;
  label: string;
  exerciseTypes: readonly ChordExerciseConfig[];
}

interface ChordExerciseBase extends TrainingExercise {
  trainingType: "chord-identification";
  level: ChordRcmLevel;
  chordType: ChordTypeId;
  inversion: ChordInversion;
  playbackPattern: ChordPlaybackPattern;
  chordNotes: readonly MusicPitch[];
  answerChoices: readonly ChordAnswerId[];
  correctAnswer: ChordAnswerId;
}

export interface ChordQualityExercise extends ChordExerciseBase {
  exerciseType: "quality";
  correctAnswer: ChordTypeId;
  answerChoices: readonly ChordTypeId[];
}

export interface ChordToneExercise extends ChordExerciseBase {
  exerciseType: "tone";
  targetTone: ChordToneId;
  targetNote: MusicPitch;
  correctAnswer: ChordToneId;
  answerChoices: readonly ChordToneId[];
}

export type ChordIdentificationExercise =
  | ChordQualityExercise
  | ChordToneExercise;

