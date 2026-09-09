import assert from "node:assert/strict";
import test from "node:test";

import {
  getNaturalNoteStepIndex,
  getNaturalNoteSteps,
  MIN_NATURAL_NOTE_STEPS,
  updateNoteRangeBoundary,
} from "./noteRange.ts";
import {
  beginDrag,
  clampLowerIndex,
  clampUpperIndex,
  endDrag,
  indexFromClientX,
  indexToPercent,
  keyboardTargetIndex,
  moveDrag,
  pickClosestThumb,
} from "./rangeSlider.ts";
import type { NoteRange } from "./types.ts";

const TREBLE_LIMITS: NoteRange = {
  min: { letter: "C", octave: 3 },
  max: { letter: "A", octave: 6 },
};

const BASS_LIMITS: NoteRange = {
  min: { letter: "E", octave: 1 },
  max: { letter: "C", octave: 5 },
};

function idx(limits: NoteRange, letter: string, octave: number): number {
  return getNaturalNoteStepIndex(
    { letter: letter as NoteRange["min"]["letter"], octave },
    limits,
  );
}

function finalIndex(limits: NoteRange): number {
  return getNaturalNoteSteps(limits).length - 1;
}

for (const [name, limits] of [
  ["treble", TREBLE_LIMITS],
  ["bass", BASS_LIMITS],
] as const) {
  test(`${name}: five-note spans (C-G, D-A, F-C) are accepted unchanged`, () => {
    for (const [letter, octave] of [
      ["C", 4],
      ["D", 4],
      ["F", 4],
    ] as const) {
      const lower = idx(limits, letter, octave);
      const upper = lower + MIN_NATURAL_NOTE_STEPS;
      assert.equal(clampLowerIndex(lower, upper), lower);
      assert.equal(
        clampUpperIndex(upper, lower, finalIndex(limits)),
        upper,
      );
    }
  });

  test(`${name}: spans under five notes (C-F, C-E, C-C) are rejected`, () => {
    const c = idx(limits, "C", 4);
    const f = idx(limits, "F", 4);
    const e = idx(limits, "E", 4);
    // Upper thumb dragged too close to the lower thumb clamps back.
    assert.equal(
      clampUpperIndex(f, c, finalIndex(limits)),
      c + MIN_NATURAL_NOTE_STEPS,
    );
    assert.equal(
      clampUpperIndex(e, c, finalIndex(limits)),
      c + MIN_NATURAL_NOTE_STEPS,
    );
    assert.equal(
      clampUpperIndex(c, c, finalIndex(limits)),
      c + MIN_NATURAL_NOTE_STEPS,
    );
    // Lower thumb dragged too close to the upper thumb clamps back.
    assert.equal(clampLowerIndex(c, e), e - MIN_NATURAL_NOTE_STEPS);
    assert.equal(clampLowerIndex(e, e), e - MIN_NATURAL_NOTE_STEPS);
  });

  test(`${name}: minimum-width range slides across the whole domain`, () => {
    const last = finalIndex(limits);
    for (let start = 0; start <= last - MIN_NATURAL_NOTE_STEPS; start++) {
      assert.equal(clampLowerIndex(start, start + MIN_NATURAL_NOTE_STEPS), start);
      assert.equal(
        clampUpperIndex(start + MIN_NATURAL_NOTE_STEPS, start, last),
        start + MIN_NATURAL_NOTE_STEPS,
      );
    }
  });

  test(`${name}: updateNoteRangeBoundary enforces the minimum span`, () => {
    const c = idx(limits, "C", 4);
    const range: NoteRange = {
      min: getNaturalNoteSteps(limits)[c],
      max: getNaturalNoteSteps(limits)[c + MIN_NATURAL_NOTE_STEPS],
    };
    // Try to push the max down to C (same note): clamped to G.
    const next = updateNoteRangeBoundary(
      range,
      "max",
      getNaturalNoteSteps(limits)[c],
      limits,
    );
    assert.equal(
      getNaturalNoteStepIndex(next.max, limits),
      c + MIN_NATURAL_NOTE_STEPS,
    );
  });
}

test("drag locks exactly one thumb and never switches mid-drag", () => {
  const last = finalIndex(TREBLE_LIMITS);
  const indices = { lowerIndex: 10, upperIndex: 20 };

  let state = beginDrag("lower");
  assert.equal(state.activeThumb, "lower");

  // Drag the pointer far past the upper thumb: lower clamps, upper untouched.
  const crossed = moveDrag(state, 28, indices, last);
  assert.equal(crossed.lowerIndex, 20 - MIN_NATURAL_NOTE_STEPS);
  assert.equal(crossed.upperIndex, 20);
  assert.equal(state.activeThumb, "lower");

  // Same for the upper thumb dragged below the lower thumb.
  state = beginDrag("upper");
  const crossedUp = moveDrag(state, 0, indices, last);
  assert.equal(crossedUp.lowerIndex, 10);
  assert.equal(crossedUp.upperIndex, 10 + MIN_NATURAL_NOTE_STEPS);

  // Ending the drag releases the lock; further moves are no-ops.
  state = endDrag();
  assert.equal(state.activeThumb, null);
  assert.deepEqual(moveDrag(state, 5, indices, last), indices);
});

test("pickClosestThumb selects the nearer thumb, ties go lower", () => {
  assert.equal(pickClosestThumb(2, 10, 20), "lower");
  assert.equal(pickClosestThumb(18, 10, 20), "upper");
  assert.equal(pickClosestThumb(15, 10, 20), "lower");
  assert.equal(pickClosestThumb(20, 10, 20), "upper");
});

test("thumbs and green bar share one canonical coordinate mapping", () => {
  const last = finalIndex(TREBLE_LIMITS);
  const lowerIndex = 7;
  const upperIndex = 21;

  const lowerThumbPercent = indexToPercent(lowerIndex, last);
  const upperThumbPercent = indexToPercent(upperIndex, last);
  const greenStart = indexToPercent(lowerIndex, last);
  const greenEnd = indexToPercent(upperIndex, last);

  assert.equal(greenStart, lowerThumbPercent);
  assert.equal(greenEnd, upperThumbPercent);
  assert.equal(greenEnd - greenStart, upperThumbPercent - lowerThumbPercent);
  assert.equal(lowerThumbPercent, (7 / last) * 100);
  assert.equal(upperThumbPercent, (21 / last) * 100);
});

test("indexFromClientX maps pointer coordinates to note indices", () => {
  const last = 20;
  assert.equal(indexFromClientX(0, 0, 200, last), 0);
  assert.equal(indexFromClientX(200, 0, 200, last), last);
  assert.equal(indexFromClientX(100, 0, 200, last), 10);
  assert.equal(indexFromClientX(104, 0, 200, last), 10);
  assert.equal(indexFromClientX(105, 0, 200, last), 11);
  assert.equal(indexFromClientX(110, 0, 200, last), 11);
  // Out-of-bounds pointers clamp to the domain.
  assert.equal(indexFromClientX(-50, 0, 200, last), 0);
  assert.equal(indexFromClientX(500, 0, 200, last), last);
  // Offset tracks work the same.
  assert.equal(indexFromClientX(150, 100, 200, last), 5);
  // Degenerate width never throws.
  assert.equal(indexFromClientX(50, 0, 0, last), 0);
});

test("keyboard targets move only the focused thumb within legal bounds", () => {
  const last = finalIndex(BASS_LIMITS);
  const indices = { lowerIndex: 5, upperIndex: 12 };

  // Arrows move the focused thumb one step; the other thumb is untouched
  // because keyboardTargetIndex only returns a target for that thumb.
  assert.equal(keyboardTargetIndex("lower", "ArrowRight", indices, last), 6);
  assert.equal(keyboardTargetIndex("upper", "ArrowLeft", indices, last), 11);

  // Clamping keeps the minimum span for both directions.
  assert.equal(
    clampLowerIndex(
      keyboardTargetIndex("lower", "ArrowRight", indices, last)!,
      indices.upperIndex,
    ),
    6,
  );
  const tight = { lowerIndex: 5, upperIndex: 5 + MIN_NATURAL_NOTE_STEPS };
  assert.equal(
    clampLowerIndex(
      keyboardTargetIndex("lower", "ArrowRight", tight, last)!,
      tight.upperIndex,
    ),
    tight.lowerIndex,
  );
  assert.equal(
    clampUpperIndex(
      keyboardTargetIndex("upper", "ArrowLeft", tight, last)!,
      tight.lowerIndex,
      last,
    ),
    tight.upperIndex,
  );

  // Home/End jump to the legal extremes for each thumb.
  assert.equal(keyboardTargetIndex("lower", "Home", indices, last), 0);
  assert.equal(
    keyboardTargetIndex("lower", "End", indices, last),
    indices.upperIndex - MIN_NATURAL_NOTE_STEPS,
  );
  assert.equal(
    keyboardTargetIndex("upper", "Home", indices, last),
    indices.lowerIndex + MIN_NATURAL_NOTE_STEPS,
  );
  assert.equal(keyboardTargetIndex("upper", "End", indices, last), last);

  // Unrelated keys do nothing.
  assert.equal(keyboardTargetIndex("lower", "a", indices, last), null);
  assert.equal(keyboardTargetIndex("upper", "Tab", indices, last), null);
});
