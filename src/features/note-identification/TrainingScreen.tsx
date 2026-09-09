import {
  ArrowRight,
  Clock3,
  Flame,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import {
  NoteKeyboard,
  type NoteKeyboardSelection,
} from "@/components/music/NoteKeyboard";
import type { AccidentalMode } from "@/features/music/types";

import { NoteStaff } from "./NoteStaff";
import type {
  NoteIdentificationAnswer,
  NoteIdentificationExercise,
} from "./types";
import { isNoteIdentificationAnswerCorrect } from "./validation";

interface TrainingScreenProps {
  exercise: NoteIdentificationExercise;
  accidentalMode: AccidentalMode;
  soundEnabled: boolean;
  labelKeys: boolean;
  exerciseNumber: number;
  score: number;
  streak: number;
  selectedAnswer: NoteIdentificationAnswer | null;
  isPlaying: boolean;
  audioError: string | null;
  timeLabel: string;
  isUnlimited: boolean;
  onAnswer: (answer: NoteKeyboardSelection) => void;
  onPlay: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReset: () => void;
}

function displayPitchName(exercise: NoteIdentificationExercise): string {
  const { pitch } = exercise;
  return `${pitch.letter}${pitch.accidental || " natural"}`;
}

export function TrainingScreen({
  exercise,
  accidentalMode,
  soundEnabled,
  labelKeys,
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
    isNoteIdentificationAnswerCorrect(exercise, selectedAnswer);

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
          Read → Play → Confirm
        </p>
      </div>

      <LiquidCard className="flex flex-1 flex-col">
        <div className="flex flex-col justify-between gap-4 border-b-2 border-black p-5 sm:flex-row sm:items-end sm:p-6">
          <div>
            <p className="technical-label text-[var(--slate)]">
              Sight-reading prompt / {exercise.clef} clef
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              Which note is this?
            </h1>
          </div>
          {soundEnabled && (
            <button
              type="button"
              onClick={onPlay}
              disabled={isPlaying}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[5px] border-2 border-black bg-white px-4 text-sm font-semibold transition hover:bg-[var(--yellow)] disabled:cursor-wait disabled:opacity-55"
            >
              <Volume2 size={16} />
              {isPlaying ? "Playing…" : "Replay note"}
            </button>
          )}
        </div>

        <div className="grid flex-1 gap-5 p-4 sm:p-6 lg:grid-cols-12">
          <div className="editorial-grid relative flex min-h-[260px] items-center justify-center overflow-hidden border-2 border-black bg-[var(--paper)] px-2 py-8 lg:col-span-7">
            <span className="technical-label absolute left-3 top-3 border border-black bg-white px-2 py-1">
              One note / {exercise.clef}
            </span>
            <NoteStaff exercise={exercise} />
          </div>

          <div className="flex flex-col justify-center border-2 border-black bg-black p-4 text-white sm:p-5 lg:col-span-5">
            <div className="border-b border-white/35 pb-4">
              <div>
                <p className="technical-label text-white/55">
                  Response keyboard
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  Choose a key
                </h2>
              </div>
            </div>
            <div className="mt-5 rounded-[6px] bg-[var(--paper)] p-2 sm:p-3">
              <NoteKeyboard
                accidentalMode={accidentalMode}
                labelKeys={labelKeys}
                selectedKeyId={selectedAnswer?.keyId ?? null}
                correctPitchClass={
                  answered ? exercise.pitch.pitchClass : null
                }
                disabled={answered}
                onSelect={onAnswer}
              />
            </div>
          </div>
        </div>

        {audioError && soundEnabled && (
          <p
            role="alert"
            className="mx-4 mb-3 border border-[var(--orange)] bg-[var(--orange-soft)] px-3 py-2 text-sm font-medium sm:mx-6"
          >
            {audioError}
          </p>
        )}

        <div
          className={`mx-4 mb-4 min-h-16 border-2 px-4 py-3 sm:mx-6 sm:mb-6 ${
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
              Select the piano key that matches the written note.
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="technical-label">
                  {correct ? "Correct response" : "Incorrect response"}
                </p>
                <p className="mt-1 text-sm font-semibold sm:text-base">
                  {correct
                    ? `Yes — ${displayPitchName(exercise)}.`
                    : `The note was ${displayPitchName(exercise)} (${exercise.pitch.toneName}).`}
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[5px] border-2 border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-[var(--orange)] active:translate-y-px"
              >
                Next
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </LiquidCard>
    </main>
  );
}
