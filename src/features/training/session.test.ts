import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDuration,
  getElapsedMs,
  getRemainingMs,
  getSessionMode,
  isExpired,
  summarizeAttempts,
} from "./session.ts";

test("timed session helpers honor exact deadlines", () => {
  assert.equal(getRemainingMs(61_000, 1_000), 60_000);
  assert.equal(getRemainingMs(61_000, 62_000), 0);
  assert.equal(isExpired(61_000, 60_999), false);
  assert.equal(isExpired(61_000, 61_000), true);
  assert.equal(formatDuration(60_000), "1:00");
  assert.equal(formatDuration(59_001), "1:00");
  assert.equal(formatDuration(59_000), "0:59");
});

test("elapsed time is capped for timed sessions but not unlimited", () => {
  assert.equal(
    getElapsedMs(1_000, 70_000, 70_000, getSessionMode("one-minute")),
    60_000,
  );
  assert.equal(
    getElapsedMs(1_000, 70_000, 70_000, getSessionMode("unlimited")),
    69_000,
  );
});

test("attempt summaries handle correct, incorrect, and empty sessions", () => {
  const exercise = { id: "exercise", trainingType: "test" };
  assert.deepEqual(summarizeAttempts([]), {
    attempted: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
  });
  assert.deepEqual(
    summarizeAttempts([
      {
        exercise,
        answer: "a",
        correct: true,
        startedAtMs: 0,
        answeredAtMs: 1,
      },
      {
        exercise,
        answer: "b",
        correct: false,
        startedAtMs: 2,
        answeredAtMs: 3,
      },
      {
        exercise,
        answer: "a",
        correct: true,
        startedAtMs: 4,
        answeredAtMs: 5,
      },
    ]),
    {
      attempted: 3,
      correct: 2,
      incorrect: 1,
      accuracy: 67,
    },
  );
});
