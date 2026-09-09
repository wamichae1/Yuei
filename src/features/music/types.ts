export type MusicClef = "treble" | "bass";
export type ClefSelection = MusicClef | "both";

export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type NoteAccidental = "" | "#" | "b";

export type AccidentalMode =
  | "naturals"
  | "sharps"
  | "flats"
  | "sharps-and-flats";

export interface NaturalPitchBoundary {
  letter: NoteLetter;
  octave: number;
}

export interface NoteRange {
  min: NaturalPitchBoundary;
  max: NaturalPitchBoundary;
}

export interface MusicPitch {
  letter: NoteLetter;
  accidental: NoteAccidental;
  octave: number;
  midi: number;
  pitchClass: number;
  toneName: string;
  vexKey: string;
}

export interface GeneratedNote {
  clef: MusicClef;
  pitch: MusicPitch;
}
