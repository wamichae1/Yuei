export type TrainingPhase = "setup" | "training" | "results";

export interface TrainingExercise {
  id: string;
  trainingType: string;
}

export interface TrainingAttempt<
  Exercise extends TrainingExercise,
  Answer,
> {
  exercise: Exercise;
  answer: Answer;
  correct: boolean;
  startedAtMs: number;
  answeredAtMs: number;
}

export type SessionMode =
  | {
      id: "one-minute" | "three-minutes";
      kind: "timed";
      label: string;
      durationSeconds: 60 | 180;
    }
  | {
      id: "unlimited";
      kind: "unlimited";
      label: string;
    };

export interface TrainingSessionState<
  Exercise extends TrainingExercise,
  Answer,
> {
  phase: TrainingPhase;
  currentExercise: Exercise | null;
  currentExerciseStartedAtMs: number | null;
  selectedAnswer: Answer | null;
  attempts: TrainingAttempt<Exercise, Answer>[];
  streak: number;
  bestStreak: number;
  startedAtMs: number | null;
  endedAtMs: number | null;
  deadlineMs: number | null;
  nowMs: number;
}
