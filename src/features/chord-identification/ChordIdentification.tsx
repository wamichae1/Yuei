"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Layers3 } from "lucide-react";

import {
  playMusicEvents,
  stopMusicPlayback,
  unlockMusicAudio,
} from "@/features/music/audio";
import {
  formatDuration,
  getElapsedMs,
  getExerciseNumber,
  getRemainingMs,
  getSessionMode,
} from "@/features/training/session";
import { useTrainingSession } from "@/features/training/useTrainingSession";

import { getChordPlaybackPlan } from "./playback";
import { ResultsScreen } from "./ResultsScreen";
import { SetupScreen } from "./SetupScreen";
import {
  createChordIdentificationExercise,
  isChordAnswerCorrect,
} from "./theory";
import {
  CHORD_ANSWER_SHORTCUTS,
  TrainingScreen,
} from "./TrainingScreen";
import type {
  ChordAnswerId,
  ChordIdentificationConfig,
  ChordIdentificationExercise,
} from "./types";

const DEFAULT_CONFIG: ChordIdentificationConfig = {
  rcmLevel: 1,
  sessionModeId: "one-minute",
};

export function ChordIdentification() {
  const [config, setConfig] =
    useState<ChordIdentificationConfig>(DEFAULT_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const playbackToken = useRef(0);
  const playingRef = useRef(false);

  const sessionMode = useMemo(
    () => getSessionMode(config.sessionModeId),
    [config.sessionModeId],
  );
  const createExercise = useCallback(
    () => createChordIdentificationExercise(config.rcmLevel),
    [config.rcmLevel],
  );
  const gradeAnswer = useCallback(
    (
      exercise: ChordIdentificationExercise,
      answer: ChordAnswerId,
    ) => isChordAnswerCorrect(exercise, answer),
    [],
  );
  const {
    state,
    startSession,
    submitAnswer,
    nextExercise,
    endSession,
    returnToSetup,
  } = useTrainingSession({
    sessionMode,
    createExercise,
    gradeAnswer,
  });

  const playTarget = useCallback(
    async (exercise: ChordIdentificationExercise) => {
      if (playingRef.current) return;

      const token = ++playbackToken.current;
      playingRef.current = true;
      setIsPlaying(true);
      setAudioError(null);

      try {
        const playbackPlan = getChordPlaybackPlan(exercise);
        const durationMs = await playMusicEvents(
          playbackPlan.events,
          playbackPlan.options,
        );
        window.setTimeout(() => {
          if (playbackToken.current !== token) return;
          playingRef.current = false;
          setIsPlaying(false);
        }, durationMs);
      } catch {
        if (playbackToken.current === token) {
          playingRef.current = false;
          setIsPlaying(false);
          setAudioError(
            "Audio could not start. Check your output, then press Replay.",
          );
        }
      }
    },
    [],
  );

  const silenceAudio = useCallback(() => {
    playbackToken.current += 1;
    playingRef.current = false;
    setIsPlaying(false);
    void stopMusicPlayback();
  }, []);

  const prepareAndStart = useCallback(async () => {
    setAudioError(null);
    try {
      await unlockMusicAudio();
    } catch {
      setAudioError(
        "Audio could not initialize automatically. Press Replay to try again.",
      );
    }
    startSession();
  }, [startSession]);

  const handleSetup = useCallback(() => {
    silenceAudio();
    returnToSetup();
  }, [returnToSetup, silenceAudio]);

  const handleEnd = useCallback(() => {
    silenceAudio();
    endSession();
  }, [endSession, silenceAudio]);

  const handleNext = useCallback(() => {
    silenceAudio();
    nextExercise();
  }, [nextExercise, silenceAudio]);

  useEffect(() => {
    if (state.phase !== "training" || !state.currentExercise) return;
    void playTarget(state.currentExercise);
  }, [playTarget, state.currentExercise, state.phase]);

  useEffect(() => {
    if (state.phase === "training") return;
    playbackToken.current += 1;
    playingRef.current = false;
    void stopMusicPlayback();
  }, [state.phase]);

  useEffect(
    () => () => {
      playbackToken.current += 1;
      playingRef.current = false;
      void stopMusicPlayback();
    },
    [],
  );

  const currentExercise = state.currentExercise;
  useEffect(() => {
    if (state.phase !== "training" || !currentExercise) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
            target.tagName,
          ))
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        void playTarget(currentExercise);
        return;
      }

      if (state.selectedAnswer !== null && event.key === "Enter") {
        event.preventDefault();
        handleNext();
        return;
      }

      if (state.selectedAnswer !== null) return;

      const optionIndex = CHORD_ANSWER_SHORTCUTS.findIndex(
        (candidate) => candidate === event.key,
      );
      const answer = currentExercise.answerChoices[optionIndex];
      if (answer) {
        event.preventDefault();
        submitAnswer(answer);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentExercise,
    handleNext,
    playTarget,
    state.phase,
    state.selectedAnswer,
    submitAnswer,
  ]);

  const elapsedMs = getElapsedMs(
    state.startedAtMs,
    state.endedAtMs,
    state.nowMs,
    sessionMode,
  );
  const remainingMs = getRemainingMs(state.deadlineMs, state.nowMs);
  const timeLabel =
    sessionMode.kind === "timed"
      ? formatDuration(remainingMs ?? 0)
      : formatDuration(elapsedMs);
  const score = state.attempts.filter(
    (attempt) => attempt.correct,
  ).length;

  return (
    <div className="relative flex min-h-svh flex-col bg-[var(--paper)] text-[var(--ink)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(10,10,10,0.055)_1px,transparent_1px)] [background-size:calc((100vw-2rem)/12)_100%]"
      />

      <header className="relative z-10 border-b-2 border-black bg-[var(--paper)]">
        <nav className="mx-auto grid h-20 w-full max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-3 lg:col-span-4"
            aria-label="Return to Yuei.AI training home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[6px] border-2 border-black bg-[var(--orange)] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:translate-y-0">
              <Layers3 size={19} strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-[-0.055em]">
              Yuei<span className="text-[var(--green)]">.</span>
            </span>
          </Link>

          <div className="flex items-center justify-end gap-3 lg:col-span-8 lg:grid lg:grid-cols-8">
            <span className="technical-label hidden text-[var(--slate)] sm:inline lg:col-span-5 lg:border-l lg:border-[var(--gridline)] lg:pl-5">
              Ear-training system / Chords 03
            </span>
            <span className="technical-label rounded-[5px] border border-black bg-black px-3 py-2 text-white lg:col-span-3 lg:justify-self-end">
              Local practice
            </span>
          </div>
        </nav>
      </header>

      <div className="relative z-[1] flex flex-1">
        {state.phase === "setup" && (
          <SetupScreen
            config={config}
            onChange={setConfig}
            onStart={() => void prepareAndStart()}
          />
        )}
        {state.phase === "training" && currentExercise && (
          <TrainingScreen
            exercise={currentExercise}
            exerciseNumber={getExerciseNumber(state)}
            score={score}
            streak={state.streak}
            selectedAnswer={state.selectedAnswer}
            isPlaying={isPlaying}
            audioError={audioError}
            timeLabel={timeLabel}
            isUnlimited={sessionMode.kind === "unlimited"}
            onAnswer={submitAnswer}
            onPlay={() => void playTarget(currentExercise)}
            onNext={handleNext}
            onEnd={handleEnd}
            onReset={handleSetup}
          />
        )}
        {state.phase === "results" && (
          <ResultsScreen
            attempts={state.attempts}
            bestStreak={state.bestStreak}
            elapsedMs={elapsedMs}
            onRestart={() => void prepareAndStart()}
            onSetup={handleSetup}
          />
        )}
      </div>

      <footer className="technical-label relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between border-t border-[var(--gridline)] px-4 py-4 text-[var(--slate)] sm:px-6 lg:px-8">
        <span>Hear first / Reveal after</span>
        <span className="hidden sm:inline">
          VexFlow notation / Salamander piano
        </span>
      </footer>
    </div>
  );
}
