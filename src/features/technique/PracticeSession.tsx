"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  RotateCcw,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  CATEGORY_LABELS,
  formatTargetTempo,
  getTechniqueFacts,
} from "./data.ts";
import { MetronomePanel } from "./MetronomePanel.tsx";
import { isAtTarget, nextTempoStep, tempoProgress } from "./tempo.ts";
import type {
  PracticeItemState,
  TechniqueDefinition,
  TechniqueProgress,
} from "./types.ts";

interface PracticeSessionProps {
  name: string;
  definitions: readonly TechniqueDefinition[];
  progress: Record<string, TechniqueProgress>;
  bpm: number;
  volume: number;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
  onProgress: (id: string, patch: Partial<TechniqueProgress>) => void;
  onClose: () => void;
}

export function PracticeSession({
  name,
  definitions,
  progress,
  bpm,
  volume,
  onBpmChange,
  onVolumeChange,
  onProgress,
  onClose,
}: PracticeSessionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [states, setStates] = useState<Record<string, PracticeItemState>>({});
  const [tempoUpdates, setTempoUpdates] = useState(0);
  const [targetsReached, setTargetsReached] = useState(0);
  const [finished, setFinished] = useState(false);
  const selected = definitions[selectedIndex];
  const completed = Object.values(states).filter(
    (state) => state === "completed",
  ).length;
  const skipped = Object.values(states).filter(
    (state) => state === "skipped",
  ).length;

  const selectedProgress = selected ? progress[selected.id] : undefined;
  const select = (index: number) => {
    const definition = definitions[index];
    setSelectedIndex(index);
    onBpmChange(
      progress[definition.id]?.currentPracticeTempo ??
        definition.tempo.bpm ??
        bpm,
    );
    onProgress(definition.id, {
      lastPracticedAt: new Date().toISOString(),
      totalPracticeSessions:
        (progress[definition.id]?.totalPracticeSessions ?? 0) + 1,
    });
  };

  if (finished) {
    return (
      <SessionShell name={name} onClose={onClose}>
        <div className="mx-auto max-w-xl border-2 border-black bg-white p-6 text-center sm:p-10">
          <Check className="mx-auto" size={48} />
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
            Practice complete
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <Summary label="Exercises" value={definitions.length} />
            <Summary label="Completed" value={completed} />
            <Summary label="Skipped" value={skipped} />
            <Summary label="Tempos updated" value={tempoUpdates} />
            <Summary label="Reached target" value={targetsReached} />
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 border-2 border-black bg-black px-5 font-semibold text-white"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => {
                setStates({});
                setSelectedIndex(0);
                setFinished(false);
              }}
              className="inline-flex min-h-12 items-center gap-2 border-2 border-black bg-white px-5 font-semibold"
            >
              <RotateCcw size={17} /> Practice again
            </button>
            {skipped ? (
              <button
                type="button"
                onClick={() => {
                  const firstSkipped = definitions.findIndex(
                    (item) => states[item.id] === "skipped",
                  );
                  setFinished(false);
                  select(Math.max(0, firstSkipped));
                }}
                className="min-h-12 border-2 border-black bg-[var(--orange)] px-5 font-semibold"
              >
                Practice skipped
              </button>
            ) : null}
          </div>
        </div>
      </SessionShell>
    );
  }

  if (!selected) return null;
  const facts = getTechniqueFacts(selected);

  return (
    <SessionShell name={name} onClose={onClose}>
      <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
        <aside className="border-2 border-black bg-white">
          <div className="border-b-2 border-black bg-[var(--orange)] p-4">
            <p className="technical-label">Session progress</p>
            <p className="mt-1 text-2xl font-bold">
              {completed} / {definitions.length} complete
            </p>
          </div>
          <ol className="max-h-[55vh] overflow-y-auto">
            {definitions.map((definition, index) => (
              <li key={definition.id} className="border-b border-black">
                <button
                  type="button"
                  onClick={() => select(index)}
                  className={`flex min-h-14 w-full items-center gap-3 px-3 text-left ${selectedIndex === index ? "bg-[var(--yellow)]" : "bg-white"}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center border border-black">
                    {states[definition.id] === "completed"
                      ? "✓"
                      : states[definition.id] === "skipped"
                        ? "—"
                        : "○"}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate">
                      {definition.shortDisplayName ?? definition.displayName}
                    </strong>
                    <span className="technical-label">
                      {CATEGORY_LABELS[definition.category]}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="min-w-0 border-2 border-black bg-white p-5 sm:p-7">
          <p className="technical-label">
            Exercise {selectedIndex + 1} / {definitions.length}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {selected.displayName}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span
                key={fact}
                className="border border-black bg-[var(--paper)] px-2 py-1 text-sm"
              >
                {fact}
              </span>
            ))}
          </div>
          {selected.specialInstructions?.length ? (
            <ul className="mt-4 list-disc pl-5 text-sm">
              {selected.specialInstructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="border-2 border-black bg-[var(--paper)] p-4">
              <p className="technical-label">Saved practice tempo</p>
              <p className="mt-2 text-3xl font-bold">
                {selectedProgress?.currentPracticeTempo ?? "Not set"}
                {selectedProgress?.currentPracticeTempo ? " BPM" : ""}
              </p>
              <div className="mt-3 h-3 border border-black bg-white">
                <div
                  className="h-full bg-[var(--green)]"
                  style={{
                    width: `${tempoProgress(selectedProgress?.currentPracticeTempo, selected.tempo.bpm)}%`,
                  }}
                />
              </div>
              <p className="technical-label mt-2">
                {isAtTarget(
                  selectedProgress?.currentPracticeTempo,
                  selected.tempo.bpm,
                )
                  ? "At target tempo"
                  : "Tempo progress — not mastery"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onBpmChange(selected.tempo.bpm)}
              className="border-2 border-black bg-[var(--green)] p-4 text-left"
            >
              <p className="technical-label">Official RCM target</p>
              <p className="mt-2 text-3xl font-bold">
                {formatTargetTempo(selected)}
              </p>
              <p className="mt-2 text-sm">
                Set metronome temporarily. Progress is not overwritten.
              </p>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[4, 5, 8].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() =>
                  onBpmChange(
                    nextTempoStep(bpm, selected.tempo.bpm, step),
                  )
                }
                className="min-h-11 border-2 border-black bg-white px-4 font-semibold"
              >
                +{step}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                onBpmChange(nextTempoStep(bpm, selected.tempo.bpm))
              }
              className="min-h-11 border-2 border-black bg-[var(--yellow)] px-4 font-semibold"
            >
              Next step
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t-2 border-black pt-5">
            <button
              type="button"
              onClick={() => {
                setStates((current) => ({
                  ...current,
                  [selected.id]: "completed",
                }));
                onProgress(selected.id, {
                  lastPracticedAt: new Date().toISOString(),
                  totalCompletions:
                    (selectedProgress?.totalCompletions ?? 0) + 1,
                });
              }}
              className="inline-flex min-h-12 items-center gap-2 border-2 border-black bg-[var(--green)] px-5 font-semibold"
            >
              <Check size={18} /> Complete
            </button>
            <button
              type="button"
              onClick={() => {
                setStates((current) => ({
                  ...current,
                  [selected.id]: "skipped",
                }));
                onProgress(selected.id, {
                  totalSkips: (selectedProgress?.totalSkips ?? 0) + 1,
                });
              }}
              className="inline-flex min-h-12 items-center gap-2 border-2 border-black bg-white px-5 font-semibold"
            >
              <Flag size={18} /> Skip
            </button>
            <label className="min-w-40">
              <span className="technical-label block">Technique status</span>
              <select
                aria-label="Technique progress status"
                value={selectedProgress?.status ?? "not_started"}
                onChange={(event) =>
                  onProgress(selected.id, {
                    status: event.target.value as NonNullable<
                      TechniqueProgress["status"]
                    >,
                  })
                }
                className="mt-1 min-h-11 w-full border-2 border-black bg-white px-2"
              >
                <option value="not_started">Not Started</option>
                <option value="learning">Learning</option>
                <option value="developing">Developing</option>
                <option value="at_target">At Target</option>
                <option value="mastered">Mastered</option>
              </select>
            </label>
            <button
              type="button"
              aria-pressed={selectedProgress?.markedForReview ?? false}
              onClick={() =>
                onProgress(selected.id, {
                  markedForReview: !selectedProgress?.markedForReview,
                })
              }
              className={`min-h-11 border-2 border-black px-3 font-semibold ${
                selectedProgress?.markedForReview
                  ? "bg-[var(--orange)]"
                  : "bg-white"
              }`}
            >
              Needs review
            </button>
            <button
              type="button"
              disabled={selectedIndex === 0}
              onClick={() => select(selectedIndex - 1)}
              className="ml-auto grid h-12 w-12 place-items-center border-2 border-black bg-white disabled:opacity-30"
              aria-label="Previous exercise"
            >
              <ArrowLeft size={19} />
            </button>
            {selectedIndex === definitions.length - 1 ? (
              <button
                type="button"
                onClick={() => setFinished(true)}
                className="min-h-12 border-2 border-black bg-black px-5 font-semibold text-white"
              >
                Finish set
              </button>
            ) : (
              <button
                type="button"
                onClick={() => select(selectedIndex + 1)}
                className="grid h-12 w-12 place-items-center border-2 border-black bg-black text-white"
                aria-label="Next exercise"
              >
                <ArrowRight size={19} />
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5">
        <MetronomePanel
          bpm={bpm}
          volume={volume}
          targetTempo={selected.tempo.bpm}
          onBpmChange={onBpmChange}
          onVolumeChange={onVolumeChange}
          onSavePracticeTempo={() => {
            const previouslyAtTarget = isAtTarget(
              selectedProgress?.currentPracticeTempo,
              selected.tempo.bpm,
            );
            onProgress(selected.id, {
              currentPracticeTempo: bpm,
              status:
                selectedProgress?.status === "mastered"
                  ? "mastered"
                  : bpm >= selected.tempo.bpm
                    ? "at_target"
                    : selectedProgress?.status ?? "learning",
            });
            setTempoUpdates((value) => value + 1);
            if (!previouslyAtTarget && bpm >= selected.tempo.bpm) {
              setTargetsReached((value) => value + 1);
            }
          }}
          onMarkAchieved={() =>
            onProgress(selected.id, {
              highestComfortableTempo: Math.max(
                selectedProgress?.highestComfortableTempo ?? 0,
                bpm,
              ),
              status:
                selectedProgress?.status === "mastered"
                  ? "mastered"
                  : bpm >= selected.tempo.bpm
                    ? "at_target"
                    : "developing",
            })
          }
        />
      </div>
    </SessionShell>
  );
}

function SessionShell({
  name,
  onClose,
  children,
}: {
  name: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh bg-[var(--paper)] p-4 text-[var(--ink)] sm:p-6">
      <div className="editorial-grid pointer-events-none absolute inset-0 opacity-35" />
      <header className="relative z-10 mx-auto mb-5 flex max-w-[1200px] items-center gap-4 border-b-2 border-black pb-4">
        <div className="min-w-0 flex-1">
          <p className="technical-label">Technique practice session</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">{name}</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close practice session"
          className="grid h-12 w-12 place-items-center border-2 border-black bg-white"
        >
          <X size={20} />
        </button>
      </header>
      <main className="relative z-10 mx-auto max-w-[1200px]">{children}</main>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-black bg-[var(--paper)] p-3">
      <p className="technical-label">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
