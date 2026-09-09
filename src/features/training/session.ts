import type {
  SessionMode,
  TrainingAttempt,
  TrainingExercise,
  TrainingSessionState,
} from "./types";

export const SESSION_MODES: readonly SessionMode[] = [
  {
    id: "one-minute",
    kind: "timed",
    label: "1 minute",
    durationSeconds: 60,
  },
  {
    id: "three-minutes",
    kind: "timed",
    label: "3 minutes",
    durationSeconds: 180,
  },
  {
    id: "unlimited",
    kind: "unlimited",
    label: "Unlimited",
  },
] as const;

export type SessionModeId = (typeof SESSION_MODES)[number]["id"];

export function getSessionMode(id: SessionModeId): SessionMode {
  const mode = SESSION_MODES.find((candidate) => candidate.id === id);
  if (!mode) {
    throw new Error(`Unknown session mode: ${id}`);
  }
  return mode;
}

export function getRemainingMs(
  deadlineMs: number | null,
  nowMs: number,
): number | null {
  return deadlineMs === null ? null : Math.max(0, deadlineMs - nowMs);
}

export function isExpired(
  deadlineMs: number | null,
  nowMs: number,
): boolean {
  return deadlineMs !== null && nowMs >= deadlineMs;
}

export function getElapsedMs(
  startedAtMs: number | null,
  endedAtMs: number | null,
  nowMs: number,
  mode: SessionMode,
): number {
  if (startedAtMs === null) return 0;

  const rawElapsed = Math.max(0, (endedAtMs ?? nowMs) - startedAtMs);
  return mode.kind === "timed"
    ? Math.min(rawElapsed, mode.durationSeconds * 1000)
    : rawElapsed;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getExerciseNumber<
  Exercise extends TrainingExercise,
  Answer,
>(state: TrainingSessionState<Exercise, Answer>): number {
  if (!state.currentExercise) return state.attempts.length;
  return (
    state.attempts.length + (state.selectedAnswer === null ? 1 : 0)
  );
}

export interface SessionSummary {
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export function summarizeAttempts<
  Exercise extends TrainingExercise,
  Answer,
>(
  attempts: readonly TrainingAttempt<Exercise, Answer>[],
): SessionSummary {
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const attempted = attempts.length;

  return {
    attempted,
    correct,
    incorrect: attempted - correct,
    accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
  };
}
