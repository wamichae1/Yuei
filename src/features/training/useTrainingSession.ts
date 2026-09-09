"use client";

import { useCallback, useEffect, useState } from "react";

import { isExpired } from "./session";
import type {
  SessionMode,
  TrainingExercise,
  TrainingSessionState,
} from "./types";

interface UseTrainingSessionOptions<
  Exercise extends TrainingExercise,
  Answer,
> {
  sessionMode: SessionMode;
  createExercise: () => Exercise;
  gradeAnswer: (exercise: Exercise, answer: Answer) => boolean;
}

function createInitialState<
  Exercise extends TrainingExercise,
  Answer,
>(): TrainingSessionState<Exercise, Answer> {
  return {
    phase: "setup",
    currentExercise: null,
    currentExerciseStartedAtMs: null,
    selectedAnswer: null,
    attempts: [],
    streak: 0,
    bestStreak: 0,
    startedAtMs: null,
    endedAtMs: null,
    deadlineMs: null,
    nowMs: Date.now(),
  };
}

function finishState<Exercise extends TrainingExercise, Answer>(
  state: TrainingSessionState<Exercise, Answer>,
  nowMs: number,
): TrainingSessionState<Exercise, Answer> {
  return {
    ...state,
    phase: "results",
    currentExercise: null,
    currentExerciseStartedAtMs: null,
    selectedAnswer: null,
    endedAtMs: nowMs,
    nowMs,
  };
}

export function useTrainingSession<
  Exercise extends TrainingExercise,
  Answer,
>({
  sessionMode,
  createExercise,
  gradeAnswer,
}: UseTrainingSessionOptions<Exercise, Answer>) {
  const [state, setState] = useState<
    TrainingSessionState<Exercise, Answer>
  >(() => createInitialState());

  const startSession = useCallback(() => {
    const nowMs = Date.now();
    const exercise = createExercise();

    setState({
      phase: "training",
      currentExercise: exercise,
      currentExerciseStartedAtMs: nowMs,
      selectedAnswer: null,
      attempts: [],
      streak: 0,
      bestStreak: 0,
      startedAtMs: nowMs,
      endedAtMs: null,
      deadlineMs:
        sessionMode.kind === "timed"
          ? nowMs + sessionMode.durationSeconds * 1000
          : null,
      nowMs,
    });
  }, [createExercise, sessionMode]);

  const submitAnswer = useCallback(
    (answer: Answer) => {
      setState((current) => {
        if (
          current.phase !== "training" ||
          !current.currentExercise ||
          current.selectedAnswer !== null
        ) {
          return current;
        }

        const nowMs = Date.now();
        if (isExpired(current.deadlineMs, nowMs)) {
          return finishState(current, nowMs);
        }

        const correct = gradeAnswer(current.currentExercise, answer);
        const nextStreak = correct ? current.streak + 1 : 0;

        return {
          ...current,
          selectedAnswer: answer,
          attempts: [
            ...current.attempts,
            {
              exercise: current.currentExercise,
              answer,
              correct,
              startedAtMs: current.currentExerciseStartedAtMs ?? nowMs,
              answeredAtMs: nowMs,
            },
          ],
          streak: nextStreak,
          bestStreak: Math.max(current.bestStreak, nextStreak),
          nowMs,
        };
      });
    },
    [gradeAnswer],
  );

  const nextExercise = useCallback(() => {
    setState((current) => {
      if (
        current.phase !== "training" ||
        current.selectedAnswer === null
      ) {
        return current;
      }

      const nowMs = Date.now();
      if (isExpired(current.deadlineMs, nowMs)) {
        return finishState(current, nowMs);
      }

      return {
        ...current,
        currentExercise: createExercise(),
        currentExerciseStartedAtMs: nowMs,
        selectedAnswer: null,
        nowMs,
      };
    });
  }, [createExercise]);

  const endSession = useCallback(() => {
    setState((current) =>
      current.phase === "training"
        ? finishState(current, Date.now())
        : current,
    );
  }, []);

  const returnToSetup = useCallback(() => {
    setState(createInitialState());
  }, []);

  useEffect(() => {
    if (state.phase !== "training") return;

    const tick = () => {
      setState((current) => {
        if (current.phase !== "training") return current;

        const nowMs = Date.now();
        return isExpired(current.deadlineMs, nowMs)
          ? finishState(current, nowMs)
          : { ...current, nowMs };
      });
    };

    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  return {
    state,
    startSession,
    submitAnswer,
    nextExercise,
    endSession,
    returnToSetup,
  };
}
