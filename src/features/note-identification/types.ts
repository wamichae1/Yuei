import type { NoteKeyboardSelection } from "@/components/music/NoteKeyboard";
import type {
  AccidentalMode,
  ClefSelection,
  MusicClef,
  MusicPitch,
  NoteRange,
} from "@/features/music/types";
import type { SessionModeId } from "@/features/training/session";
import type { TrainingExercise } from "@/features/training/types";

export type ClefRanges = Record<MusicClef, NoteRange>;

export interface NoteIdentificationConfig {
  clef: ClefSelection;
  ranges: ClefRanges;
  accidentalMode: AccidentalMode;
  soundEnabled: boolean;
  labelKeys: boolean;
  sessionModeId: SessionModeId;
}

export interface NoteIdentificationExercise extends TrainingExercise {
  trainingType: "note-identification";
  clef: MusicClef;
  pitch: MusicPitch;
}

export type NoteIdentificationAnswer = NoteKeyboardSelection;
