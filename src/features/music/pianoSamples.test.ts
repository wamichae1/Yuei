import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  CLEF_SUPPORTED_RANGES,
  createMusicPitch,
  getNoteCandidates,
  naturalMidi,
} from "./noteGenerator.ts";
import {
  buildPianoSampleBaseUrl,
  getClosestPianoSampleDistance,
  getPianoSampleMidi,
  isPianoMidiCovered,
  MAX_PIANO_SAMPLE_DISTANCE_SEMITONES,
  PIANO_SAMPLE_DIRECTORY,
  PIANO_SAMPLE_URLS,
} from "./pianoSamples.ts";
import type { AccidentalMode, MusicClef } from "./types.ts";

test("the bundled piano manifest contains the compact 23-sample set", () => {
  assert.equal(Object.keys(PIANO_SAMPLE_URLS).length, 23);

  for (const filename of Object.values(PIANO_SAMPLE_URLS)) {
    assert.ok(
      existsSync(
        path.join(
          process.cwd(),
          "public",
          PIANO_SAMPLE_DIRECTORY,
          filename,
        ),
      ),
      `Missing piano sample: ${filename}`,
    );
  }
});

test("every supported Yuei piano pitch is near a recorded sample", () => {
  const lowestPlayableMidi = naturalMidi({ letter: "E", octave: 1 });
  const highestPlayableMidi = naturalMidi({ letter: "A", octave: 6 });

  for (
    let midi = lowestPlayableMidi;
    midi <= highestPlayableMidi;
    midi += 1
  ) {
    assert.ok(
      isPianoMidiCovered(midi),
      `MIDI ${midi} is ${getClosestPianoSampleDistance(midi)} semitones from a sample`,
    );
  }
});

test("sample coverage includes boundaries, sharps, and flats", () => {
  const e1 = createMusicPitch("E", 1, "");
  const a6 = createMusicPitch("A", 6, "");
  const cSharp4 = createMusicPitch("C", 4, "#");
  const dFlat4 = createMusicPitch("D", 4, "b");

  assert.equal(getPianoSampleMidi("D#1"), 27);
  assert.equal(getPianoSampleMidi("A6"), 93);
  assert.equal(
    getClosestPianoSampleDistance(e1.midi),
    MAX_PIANO_SAMPLE_DISTANCE_SEMITONES,
  );
  assert.equal(getClosestPianoSampleDistance(a6.midi), 0);
  assert.equal(cSharp4.midi, dFlat4.midi);
  assert.ok(isPianoMidiCovered(cSharp4.midi));
  assert.ok(isPianoMidiCovered(dFlat4.midi));
});

test("every generated full-range note is covered by the piano samples", () => {
  const clefs: readonly MusicClef[] = ["treble", "bass"];
  const modes: readonly AccidentalMode[] = [
    "naturals",
    "sharps",
    "flats",
    "sharps-and-flats",
  ];

  for (const clef of clefs) {
    for (const accidentalMode of modes) {
      const candidates = getNoteCandidates({
        clef,
        range: CLEF_SUPPORTED_RANGES[clef],
        accidentalMode,
      });

      assert.ok(candidates.length > 0);
      assert.ok(
        candidates.every((pitch) => isPianoMidiCovered(pitch.midi)),
        `${clef}/${accidentalMode} generated an uncovered pitch`,
      );
    }
  }
});

test("piano sample URLs include the static GitHub Pages base path", () => {
  const expected =
    "https://example.test/Yuei/audio/piano/salamander/";

  assert.equal(
    buildPianoSampleBaseUrl("https://example.test", "/Yuei"),
    expected,
  );
  assert.equal(
    buildPianoSampleBaseUrl(
      "https://example.test/Yuei/playbacks/10/",
      "/Yuei/",
    ),
    expected,
  );
});
