import type { TrainingAttempt } from "@/features/training/types";

import { getChordAnswerLabel } from "./theory.ts";
import type {
  ChordAnswerId,
  ChordIdentificationExercise,
} from "./types.ts";

export interface ChordBreakdownRow {
  answerId: ChordAnswerId;
  label: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export function buildChordBreakdown(
  attempts: readonly TrainingAttempt<
    ChordIdentificationExercise,
    ChordAnswerId
  >[],
): ChordBreakdownRow[] {
  const totals = new Map<
    ChordAnswerId,
    { attempted: number; correct: number }
  >();

  for (const attempt of attempts) {
    const answerId = attempt.exercise.correctAnswer;
    const current = totals.get(answerId) ?? {
      attempted: 0,
      correct: 0,
    };
    current.attempted += 1;
    current.correct += attempt.correct ? 1 : 0;
    totals.set(answerId, current);
  }

  return [...totals.entries()]
    .map(([answerId, total]) => ({
      answerId,
      label: getChordAnswerLabel(answerId),
      attempted: total.attempted,
      correct: total.correct,
      accuracy: Math.round((total.correct / total.attempted) * 100),
    }))
    .sort(
      (a, b) =>
        a.accuracy - b.accuracy ||
        b.attempted - a.attempted ||
        a.label.localeCompare(b.label),
    );
}
