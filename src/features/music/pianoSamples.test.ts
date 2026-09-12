import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { naturalMidi } from "./noteGenerator.ts";
import {
  PIANO_SAMPLE_DIRECTORY,
  PIANO_SAMPLE_URLS,
} from "./pianoSamples.ts";
import type { NoteLetter } from "./types.ts";

function sampleMidi(note: string): number {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  assert.ok(match, `Invalid sample note: ${note}`);

  const [, letter, accidental, octave] = match;
  return (
    naturalMidi({
      letter: letter as NoteLetter,
      octave: Number(octave),
    }) + (accidental === "#" ? 1 : 0)
  );
}

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

test("every playable Note Identification pitch is near a recorded sample", () => {
  const sampleMidis = Object.keys(PIANO_SAMPLE_URLS).map(sampleMidi);
  const lowestPlayableMidi = naturalMidi({ letter: "E", octave: 1 });
  const highestPlayableMidi = naturalMidi({ letter: "A", octave: 6 });

  for (
    let midi = lowestPlayableMidi;
    midi <= highestPlayableMidi;
    midi += 1
  ) {
    const closestDistance = Math.min(
      ...sampleMidis.map((sample) => Math.abs(sample - midi)),
    );
    assert.ok(
      closestDistance <= 1,
      `MIDI ${midi} is ${closestDistance} semitones from a sample`,
    );
  }
});
