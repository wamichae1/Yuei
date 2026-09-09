import type { TrainingAttempt } from "@/features/training/types";

import { INTERVAL_DEFINITIONS, INTERVAL_ORDER } from "./theory.ts";
import type { IntervalExercise, IntervalId } from "./types";

export interface IntervalBreakdownRow {
  intervalId: IntervalId;
  label: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export function buildIntervalBreakdown(
  attempts: readonly TrainingAttempt<IntervalExercise, IntervalId>[],
): IntervalBreakdownRow[] {
  const totals = new Map<
    IntervalId,
    { attempted: number; correct: number }
  >();

  for (const attempt of attempts) {
    const intervalId = attempt.exercise.intervalId;
    const current = totals.get(intervalId) ?? {
      attempted: 0,
      correct: 0,
    };
    current.attempted += 1;
    current.correct += attempt.correct ? 1 : 0;
    totals.set(intervalId, current);
  }

  return INTERVAL_ORDER.filter((intervalId) => totals.has(intervalId))
    .map((intervalId) => {
      const total = totals.get(intervalId)!;
      return {
        intervalId,
        label: INTERVAL_DEFINITIONS[intervalId].label,
        attempted: total.attempted,
        correct: total.correct,
        accuracy: Math.round((total.correct / total.attempted) * 100),
      };
    })
    .sort(
      (a, b) =>
        a.accuracy - b.accuracy ||
        b.attempted - a.attempted ||
        INTERVAL_ORDER.indexOf(a.intervalId) -
          INTERVAL_ORDER.indexOf(b.intervalId),
    );
}
