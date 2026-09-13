export const PIANO_SAMPLE_URLS = {
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
} as const;

export const PIANO_SAMPLE_DIRECTORY = "audio/piano/salamander";
export const MAX_PIANO_SAMPLE_DISTANCE_SEMITONES = 1;

const NATURAL_PITCH_CLASSES = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
} as const;

export function getPianoSampleMidi(note: string): number {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  if (!match) {
    throw new Error(`Invalid piano sample note: ${note}`);
  }

  const [, letter, accidental, octave] = match;
  return (
    (Number(octave) + 1) * 12 +
    NATURAL_PITCH_CLASSES[letter as keyof typeof NATURAL_PITCH_CLASSES] +
    (accidental === "#" ? 1 : 0)
  );
}

const PIANO_SAMPLE_MIDIS = Object.keys(PIANO_SAMPLE_URLS).map(
  getPianoSampleMidi,
);

export function getClosestPianoSampleDistance(midi: number): number {
  return Math.min(
    ...PIANO_SAMPLE_MIDIS.map((sampleMidi) =>
      Math.abs(sampleMidi - midi),
    ),
  );
}

export function isPianoMidiCovered(midi: number): boolean {
  return (
    getClosestPianoSampleDistance(midi) <=
    MAX_PIANO_SAMPLE_DISTANCE_SEMITONES
  );
}

export function buildPianoSampleBaseUrl(
  origin: string,
  basePath: string,
): string {
  const normalizedBasePath =
    basePath === "/" ? "" : `/${basePath.replace(/^\/|\/$/g, "")}`;

  return new URL(
    `${normalizedBasePath}/${PIANO_SAMPLE_DIRECTORY}/`,
    origin,
  ).toString();
}

export function getPianoSampleBaseUrl(): string {
  if (typeof window === "undefined") {
    throw new Error("Piano sample URLs are only available in the browser.");
  }

  return buildPianoSampleBaseUrl(
    window.location.origin,
    process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  );
}
