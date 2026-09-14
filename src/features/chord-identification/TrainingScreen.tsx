import {
  ArrowRight,
  Clock3,
  Flame,
  Headphones,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";

import { ChordStaff } from "./ChordStaff";
import {
  formatChordPlayback,
  getChordPlaybackLabel,
  getChordRevealLabel,
} from "./playback";
import {
  getChordAnswerLabel,
  isChordAnswerCorrect,
} from "./theory";
import type {
  ChordAnswerId,
  ChordIdentificationExercise,
} from "./types";

export const CHORD_ANSWER_SHORTCUTS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
] as const;

interface TrainingScreenProps {
  exercise: ChordIdentificationExercise;
  exerciseNumber: number;
  score: number;
  streak: number;
  selectedAnswer: ChordAnswerId | null;
  isPlaying: boolean;
  audioError: string | null;
  timeLabel: string;
  isUnlimited: boolean;
  onAnswer: (answer: ChordAnswerId) => void;
  onPlay: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReset: () => void;
}

export function TrainingScreen({
  exercise,
  exerciseNumber,
  score,
  streak,
  selectedAnswer,
  isPlaying,
  audioError,
  timeLabel,
  isUnlimited,
  onAnswer,
  onPlay,
  onNext,
  onEnd,
  onReset,
}: TrainingScreenProps) {
  const answered = selectedAnswer !== null;
  const correct =
    selectedAnswer !== null &&
    isChordAnswerCorrect(exercise, selectedAnswer);
  const prompt =
    exercise.exerciseType === "quality"
      ? "What chord do you hear?"
      : "Which chord tone is repeated?";
  const listeningHint =
    exercise.exerciseType === "quality"
      ? "Listen for the chord quality and color."
      : "Hear the broken chord, then identify the final repeated tone.";
  const correctLabel = getChordAnswerLabel(exercise.correctAnswer);

  return (
    <main
      className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
      data-exercise-id={exercise.id}
      data-revealed={answered}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-black pb-4">
        <button
          type="button"
          onClick={onReset}
          className="technical-label inline-flex min-h-9 items-center gap-2 transition hover:text-[var(--orange)]"
        >
          <RotateCcw size={15} />
          New setup
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="stat-counter">
            <Clock3 size={14} />
            {isUnlimited ? "Elapsed" : "Remaining"} / {timeLabel}
          </div>
          <div className="stat-counter">
            <span className="h-2 w-2 bg-[var(--green)]" />
            {score} correct
          </div>
          <div className="stat-counter">
            <Flame size={14} className="text-[var(--orange)]" />
            {streak} streak
          </div>
          {isUnlimited && (
            <button
              type="button"
              onClick={onEnd}
              className="stat-counter transition hover:bg-black hover:text-white"
            >
              <Square size={12} fill="currentColor" />
              End session
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="technical-label">
          Exercise {String(exerciseNumber).padStart(2, "0")}
        </p>
        <p className="technical-label text-[var(--slate)]">
          Level {exercise.level} /{" "}
          {exercise.exerciseType === "quality" ? "Quality" : "Chord tone"}
        </p>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-12">
        <LiquidCard className="flex min-h-[500px] flex-col lg:col-span-8">
          <div className="border-b-2 border-black p-5 sm:p-6">
            <p className="technical-label text-[var(--slate)]">
              Audio prompt / Chord identification
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {answered ? "See what you heard" : prompt}
            </h1>
          </div>

          <div className="flex flex-1 flex-col p-4 sm:p-6">
            {!answered ? (
              <div className="editorial-grid relative flex min-h-[300px] flex-1 flex-col items-center justify-center overflow-hidden border-2 border-black bg-[var(--paper)] px-5 py-10 text-center">
                <span className="technical-label absolute left-3 top-3 border border-black bg-white px-2 py-1">
                  Audio only / No notation
                </span>
                <div
                  aria-hidden="true"
                  className={`grid h-28 w-28 place-items-center rounded-full border-2 border-black bg-white shadow-[0_0_0_12px_var(--orange-soft),0_0_0_13px_var(--ink)] transition-transform sm:h-32 sm:w-32 ${
                    isPlaying ? "scale-105" : ""
                  }`}
                >
                  {isPlaying ? (
                    <Headphones
                      size={42}
                      className="animate-pulse"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Volume2 size={42} strokeWidth={1.8} />
                  )}
                </div>
                <p className="mt-8 max-w-sm text-lg font-semibold">
                  {listeningHint}
                </p>
                <button
                  type="button"
                  onClick={onPlay}
                  disabled={isPlaying}
                  className="mt-6 inline-flex min-h-16 min-w-52 items-center justify-center gap-3 rounded-[6px] border-2 border-black bg-[var(--orange)] px-7 text-lg font-semibold transition hover:-translate-y-0.5 hover:bg-[var(--yellow)] active:translate-y-0 disabled:cursor-wait disabled:opacity-65"
                >
                  {isPlaying ? (
                    <Headphones size={20} className="animate-pulse" />
                  ) : (
                    <Volume2 size={20} />
                  )}
                  {isPlaying ? "Playing…" : "Replay chord"}
                </button>
                <p className="technical-label mt-4 text-[var(--slate)]">
                  Spacebar / Replay the same exercise
                </p>
              </div>
            ) : (
              <div className="editorial-grid relative flex min-h-[300px] flex-1 flex-col items-center justify-center overflow-hidden border-2 border-black bg-[var(--paper)] px-2 py-6 sm:px-4">
                <span className="technical-label absolute left-3 top-3 border border-black bg-white px-2 py-1">
                  Notation reveal
                </span>
                <span className="technical-label absolute right-3 top-3 bg-black px-2 py-1 text-white">
                  {getChordPlaybackLabel(exercise)}
                </span>
                <ChordStaff exercise={exercise} />
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  <span className="technical-label border border-black bg-white px-2 py-1">
                    {formatChordPlayback(exercise)}
                  </span>
                  <span className="technical-label border border-black bg-[var(--yellow)] px-2 py-1">
                    {getChordRevealLabel(exercise)}
                  </span>
                </div>
              </div>
            )}

            {audioError && (
              <p
                role="alert"
                className="mt-3 border border-[var(--orange)] bg-[var(--orange-soft)] px-3 py-2 text-sm font-medium"
              >
                {audioError}
              </p>
            )}

            <div
              className={`mt-4 min-h-16 border-2 px-4 py-3 ${
                !answered
                  ? "border-[var(--gridline)] bg-white text-[var(--slate)]"
                  : correct
                    ? "border-black bg-[var(--green-soft)]"
                    : "border-black bg-[var(--orange-soft)]"
              }`}
              aria-live="polite"
            >
              {!answered ? (
                <div className="flex min-h-10 items-center gap-2 text-sm font-medium">
                  <Sparkles size={16} />
                  Choose an answer when you are ready to reveal the score.
                </div>
              ) : (
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="technical-label">
                      {correct ? "Correct response" : "Incorrect response"}
                    </p>
                    <p className="mt-1 text-sm font-semibold sm:text-base">
                      {correct
                        ? `Yes — ${correctLabel}.`
                        : `The correct answer was ${correctLabel}.`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={onPlay}
                      disabled={isPlaying}
                      className="inline-flex min-h-10 items-center gap-2 rounded-[5px] border-2 border-black bg-white px-3 text-sm font-semibold transition hover:bg-[var(--yellow)] disabled:opacity-50"
                    >
                      <Volume2 size={15} />
                      Replay
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-[5px] border-2 border-black bg-black px-3.5 text-sm font-semibold text-white transition hover:bg-[var(--orange)] active:translate-y-px"
                    >
                      Next
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </LiquidCard>

        <aside className="flex flex-col rounded-[10px] border-2 border-black bg-black p-5 text-white sm:p-6 lg:col-span-4">
          <div className="flex items-start justify-between gap-3 border-b border-white/35 pb-5">
            <div>
              <p className="technical-label text-white/55">
                Response panel
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                Choose one
              </h2>
            </div>
            <span className="technical-label rounded-[4px] border border-white/50 px-2 py-1 text-white/65">
              {exercise.answerChoices.length} choices
            </span>
          </div>

          <div className="my-5 grid flex-1 grid-cols-2 content-center gap-2 lg:grid-cols-1 xl:grid-cols-2">
            {exercise.answerChoices.map((answer, index) => {
              const isSelected = selectedAnswer === answer;
              const isCorrectAnswer =
                answered && exercise.correctAnswer === answer;
              const isIncorrectAnswer =
                answered && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={answer}
                  type="button"
                  disabled={answered}
                  onClick={() => onAnswer(answer)}
                  className={`group flex min-h-14 items-center gap-3 rounded-[6px] border px-3 text-left transition duration-200 ${
                    isCorrectAnswer
                      ? "border-white bg-[var(--green)] text-black"
                      : isIncorrectAnswer
                        ? "border-white bg-[var(--orange)] text-black"
                        : answered
                          ? "border-white/15 bg-transparent text-white/25"
                          : "border-white/45 bg-transparent text-white hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black active:translate-y-0"
                  }`}
                >
                  <span
                    className={`technical-label grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border ${
                      isCorrectAnswer || isIncorrectAnswer
                        ? "border-black bg-black text-white"
                        : "border-current"
                    }`}
                  >
                    {CHORD_ANSWER_SHORTCUTS[index]}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {getChordAnswerLabel(answer)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="technical-label border-t border-white/35 pt-4 leading-5 text-white/45">
            Number keys to answer / Spacebar to replay / Enter for next
          </p>
        </aside>
      </div>
    </main>
  );
}

