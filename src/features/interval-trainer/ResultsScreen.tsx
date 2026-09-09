import {
  ArrowRight,
  Clock3,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import { formatDuration, summarizeAttempts } from "@/features/training/session";
import type { TrainingAttempt } from "@/features/training/types";

import { buildIntervalBreakdown } from "./results";
import { INTERVAL_DEFINITIONS } from "./theory";
import type { IntervalExercise, IntervalId } from "./types";

interface ResultsScreenProps {
  attempts: TrainingAttempt<IntervalExercise, IntervalId>[];
  bestStreak: number;
  elapsedMs: number;
  onRestart: () => void;
  onSetup: () => void;
}

export function ResultsScreen({
  attempts,
  bestStreak,
  elapsedMs,
  onRestart,
  onSetup,
}: ResultsScreenProps) {
  const summary = summarizeAttempts(attempts);
  const breakdown = buildIntervalBreakdown(attempts);
  const message =
    summary.attempted === 0
      ? "Ready for another listen."
      : summary.accuracy >= 90
        ? "Exceptional listening."
        : summary.accuracy >= 70
          ? "A strong round."
          : "Every round sharpens the ear.";

  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-14">
      <section className="lg:col-span-4 lg:sticky lg:top-8">
        <div className="technical-label inline-flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center border border-black bg-[var(--green)]">
            <Sparkles size={13} />
          </span>
          Session complete / Results
        </div>

        <p className="mt-8 text-[clamp(6rem,14vw,10rem)] font-semibold leading-[0.72] tracking-[-0.085em]">
          {summary.accuracy}
          <span className="text-[0.3em] tracking-[-0.03em]">%</span>
        </p>
        <p className="technical-label mt-6 border-t border-black pt-3 text-[var(--slate)]">
          Accuracy / {summary.correct} of {summary.attempted} correct
        </p>
        <h1 className="mt-7 max-w-lg text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">
          {message}
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-[var(--slate)]">
          Review the interval breakdown, then listen again while the
          contrasts are fresh.
        </p>
      </section>

      <LiquidCard className="lg:col-span-8 lg:ml-3">
        <div className="grid grid-cols-2 border-b-2 border-black sm:grid-cols-5">
          <ResultStat
            icon={Target}
            label="Attempted"
            value={String(summary.attempted)}
            accent="bg-[var(--yellow)]"
          />
          <ResultStat
            icon={Sparkles}
            label="Correct"
            value={String(summary.correct)}
            accent="bg-[var(--green)]"
            bordered
          />
          <ResultStat
            icon={X}
            label="Incorrect"
            value={String(summary.incorrect)}
            accent="bg-[var(--orange)]"
            className="border-t-2 border-black sm:border-l-2 sm:border-t-0"
          />
          <ResultStat
            icon={Flame}
            label="Best streak"
            value={String(bestStreak)}
            accent="bg-[var(--orange-soft)]"
            className="border-l-2 border-t-2 border-black sm:border-t-0"
          />
          <ResultStat
            icon={Clock3}
            label="Time played"
            value={formatDuration(elapsedMs)}
            accent="bg-[var(--green-soft)]"
            className="col-span-2 border-t-2 border-black sm:col-span-1 sm:border-l-2 sm:border-t-0"
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="technical-label">Interval performance</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                Weakest intervals first
              </h2>
            </div>
            <p className="technical-label text-[var(--slate)]">
              Correct / Attempted
            </p>
          </div>

          {breakdown.length > 0 ? (
            <div className="mt-5 border-l-2 border-t-2 border-black">
              {breakdown.map((row) => (
                <div
                  key={row.intervalId}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b-2 border-r-2 border-black bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="technical-label border border-black bg-[var(--paper)] px-2 py-1">
                        {INTERVAL_DEFINITIONS[row.intervalId].shortLabel}
                      </span>
                      <p className="font-semibold">{row.label}</p>
                    </div>
                    <div className="mt-3 h-2 border border-black bg-[var(--paper)] p-px">
                      <div
                        className={`h-full ${
                          row.accuracy >= 80
                            ? "bg-[var(--green)]"
                            : row.accuracy >= 60
                              ? "bg-[var(--yellow)]"
                              : "bg-[var(--orange)]"
                        }`}
                        style={{ width: `${row.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                      {row.correct}/{row.attempted}
                    </p>
                    <p className="technical-label text-[var(--slate)]">
                      {row.accuracy}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-2 border-black bg-[var(--paper)] p-5 text-sm text-[var(--slate)]">
              No answers were submitted in this session.
            </p>
          )}

          {attempts.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between gap-4">
                <p className="technical-label">Answer ledger</p>
                <p className="technical-label text-[var(--slate)]">
                  01–{String(attempts.length).padStart(2, "0")}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-5 border-l border-t border-black sm:grid-cols-10">
                {attempts.map((attempt, index) => (
                  <div
                    key={`${attempt.exercise.id}-${index}`}
                    title={`Exercise ${index + 1}: ${
                      attempt.correct ? "correct" : "incorrect"
                    }`}
                    className={`flex aspect-square flex-col justify-between border-b border-r border-black p-2 ${
                      attempt.correct
                        ? "bg-[var(--green-soft)]"
                        : "bg-[var(--orange-soft)]"
                    }`}
                  >
                    <span className="technical-label">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold">
                      {INTERVAL_DEFINITIONS[attempt.exercise.intervalId]
                        .shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex min-h-14 flex-1 items-center justify-between rounded-[6px] border-2 border-black bg-[var(--green)] px-5 font-semibold transition hover:-translate-y-0.5 hover:bg-[var(--yellow)] active:translate-y-0"
            >
              Practice this setup again
              <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-white">
                <ArrowRight size={17} />
              </span>
            </button>
            <button
              type="button"
              onClick={onSetup}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[6px] border-2 border-black bg-white px-5 font-semibold transition hover:-translate-y-0.5 hover:bg-black hover:text-white active:translate-y-0"
            >
              <RotateCcw size={16} />
              Change setup
            </button>
          </div>
        </div>
      </LiquidCard>
    </main>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
  accent,
  bordered = false,
  className = "",
}: {
  icon: typeof Target;
  label: string;
  value: string;
  accent: string;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`min-h-36 bg-white p-4 ${
        bordered ? "border-l-2 border-black" : ""
      } ${className}`}
    >
      <div
        className={`grid h-8 w-8 place-items-center rounded-[4px] border border-black text-black ${accent}`}
      >
        <Icon size={15} />
      </div>
      <p className="technical-label mt-5 text-[var(--slate)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.055em]">
        {value}
      </p>
    </div>
  );
}
