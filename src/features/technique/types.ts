import type { TrainingLevel } from "@/features/level-training/modules";

export const TECHNIQUE_CATEGORIES = [
  "scale",
  "formula_pattern",
  "chromatic_scale",
  "tonic_triad",
  "tonic_four_note_chord",
  "dominant_seventh",
  "leading_tone_diminished_seventh",
  "arpeggio",
  "octave_scale",
] as const;

export type TechniqueCategory = (typeof TECHNIQUE_CATEGORIES)[number];

export const TECHNIQUE_PRACTICE_GROUPS = [
  "scales",
  "chords",
  "arpeggios",
  "chromatic",
  "formula",
  "octaves",
] as const;

export type TechniquePracticeGroup =
  (typeof TECHNIQUE_PRACTICE_GROUPS)[number];

export const MUSICAL_KEYS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
] as const;

export type MusicalKey = (typeof MUSICAL_KEYS)[number];
export type TechniqueTonality = "major" | "minor";
export type MinorForm = "natural" | "harmonic" | "melodic";
export type TechniqueHands = "HS" | "HT";
export type TechniqueDirection = "parallel" | "contrary";
export type TechniqueArticulation = "legato" | "staccato";

export type TechniquePattern =
  | "scale"
  | "formula"
  | "chromatic"
  | "broken_chord"
  | "solid_chord"
  | "alternate_note"
  | "arpeggio"
  | "solid_octaves"
  | "broken_octaves";

export type InversionPosition = "root" | "first" | "second" | "third";
export type InversionMode = "single" | "all" | "all_in_sequence" | "any";

export interface InversionRequirement {
  positions: readonly InversionPosition[];
  mode: InversionMode;
}

export interface TechniqueProgression {
  degrees: readonly string[];
}

export type BeatUnit =
  | "whole"
  | "dotted_half"
  | "half"
  | "dotted_quarter"
  | "quarter"
  | "dotted_eighth"
  | "eighth"
  | "sixteenth";

export interface TechniqueTempo {
  bpm: number;
  beatUnit: BeatUnit;
  performedNoteValue?: BeatUnit;
  notesPerBeat?: number;
}

export interface TechniqueSource {
  syllabus: string;
  edition: string;
  page?: number;
  section?: string;
  table?: string;
}

export interface TechniqueAlternativeOverrides {
  hands?: TechniqueHands;
  octaves?: number;
  direction?: TechniqueDirection;
  articulation?: TechniqueArticulation;
  pattern?: TechniquePattern;
  inversionRequirement?: InversionRequirement;
  endingProgression?: TechniqueProgression;
  tempo?: TechniqueTempo;
}

export interface TechniqueAlternative {
  id: string;
  label: string;
  description: string;
  overrides?: TechniqueAlternativeOverrides;
}

export interface TechniqueDefinition {
  id: string;
  level: TrainingLevel;
  category: TechniqueCategory;
  practiceGroup: TechniquePracticeGroup;
  displayName: string;
  shortDisplayName?: string;
  key?: MusicalKey;
  tonality?: TechniqueTonality;
  minorForm?: MinorForm;
  hands: TechniqueHands;
  octaves?: number;
  direction?: TechniqueDirection;
  articulation?: TechniqueArticulation;
  pattern?: TechniquePattern;
  inversionRequirement?: InversionRequirement;
  endingProgression?: TechniqueProgression;
  tempo: TechniqueTempo;
  specialInstructions?: readonly string[];
  alternatives?: readonly TechniqueAlternative[];
  source: TechniqueSource;
}

export type TechniqueStatus =
  | "not_started"
  | "learning"
  | "developing"
  | "at_target"
  | "mastered";

export interface TechniqueProgress {
  techniqueDefinitionId: string;
  currentPracticeTempo?: number;
  highestComfortableTempo?: number;
  status?: TechniqueStatus;
  lastPracticedAt?: string;
  totalPracticeSessions?: number;
  totalCompletions?: number;
  totalSkips?: number;
  markedForReview?: boolean;
  notes?: string;
}

export interface SavedPracticeSet {
  id: string;
  name: string;
  level: TrainingLevel;
  techniqueDefinitionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type GenerationStrategy =
  | "balanced"
  | "random"
  | "weak_areas"
  | "least_practiced"
  | "below_target"
  | "exam_simulation";

export type PracticeItemState = "pending" | "completed" | "skipped";

export interface TechniqueStoreData {
  version: 1;
  progress: Record<string, TechniqueProgress>;
  savedSets: SavedPracticeSet[];
  metronome: {
    bpm: number;
    volume: number;
  };
}
