import {
  ArrowRight,
  AudioLines,
  Layers3,
  Music2,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import { SESSION_MODES } from "@/features/training/session";

import {
  CHORD_DEFINITIONS,
  getExerciseTypeLabel,
  RCM_CHORD_IDENTIFICATION_CONFIG,
} from "./theory";
import type {
  ChordIdentificationConfig,
  ChordRcmLevel,
} from "./types";

interface SetupScreenProps {
  config: ChordIdentificationConfig;
  onChange: (config: ChordIdentificationConfig) => void;
  onStart: () => void;
}

function getLevelChordTypes(level: ChordRcmLevel) {
  return [
    ...new Set(
      RCM_CHORD_IDENTIFICATION_CONFIG[level].exerciseTypes.flatMap(
        (exercise) =>
          exercise.chordOptions.map((option) => option.chordType),
      ),
    ),
  ];
}

function playbackSummary(level: ChordRcmLevel): string {
  const patterns = [
    ...new Set(
      RCM_CHORD_IDENTIFICATION_CONFIG[level].exerciseTypes.map(
        (exercise) => exercise.playbackPattern,
      ),
    ),
  ];
  return patterns
    .map((pattern) => {
      if (pattern === "blocked") return "Blocked once";
      if (pattern === "broken-then-blocked") {
        return "Broken, then blocked";
      }
      return "Broken chord, then target tone";
    })
    .join(" / ");
}

export function SetupScreen({
  config,
  onChange,
  onStart,
}: SetupScreenProps) {
  const preset = RCM_CHORD_IDENTIFICATION_CONFIG[config.rcmLevel];
  const chordTypes = getLevelChordTypes(config.rcmLevel);

  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-10 px-4 py-9 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:py-12">
      <section className="lg:col-span-5 lg:self-start lg:pt-10">
        <div className="technical-label mb-7 flex items-center gap-3">
          <span className="h-2.5 w-2.5 border border-black bg-[var(--orange)]" />
          Module 03 / Chord identification
        </div>
        <h1 className="max-w-[650px] text-balance text-[clamp(4rem,8.5vw,8.3rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
          Hear
          <span className="block">the harmony.</span>
          <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">
            Name it.
          </span>
        </h1>
        <p className="mt-9 max-w-md text-pretty text-base leading-7 text-[var(--slate)] sm:text-lg sm:leading-8">
          Practice RCM chord qualities and chord tones with
          level-specific voicings and playback.
        </p>
        <div className="mt-10 grid max-w-md grid-cols-5 border-y border-black">
          {["Hear", "Answer", "Reveal", "Feedback", "Next"].map(
            (label, index) => (
              <div
                key={label}
                className={`py-3 ${
                  index > 0 ? "border-l border-black pl-2 sm:pl-3" : ""
                }`}
              >
                <span className="technical-label block text-[var(--slate)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-[11px] font-semibold sm:text-xs">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      <LiquidCard className="lg:col-span-7 lg:ml-5">
        <div className="flex items-start justify-between gap-4 border-b-2 border-black p-5 sm:p-6">
          <div>
            <p className="technical-label text-[var(--slate)]">
              Session configuration
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Choose your level
            </h2>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border-2 border-black bg-[var(--orange)]">
            <Music2 size={21} strokeWidth={2.25} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <fieldset>
            <legend className="setup-label">01 / RCM level</legend>
            <div className="grid grid-cols-5 border-l-2 border-t-2 border-black">
              {Array.from({ length: 10 }, (_, index) => {
                const level = (index + 1) as ChordRcmLevel;
                const selected = config.rcmLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    aria-label={`RCM Level ${level}`}
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({ ...config, rcmLevel: level })
                    }
                    className={`min-h-12 border-b-2 border-r-2 border-black text-sm font-semibold transition ${
                      selected
                        ? "bg-[var(--orange)]"
                        : "bg-white hover:bg-[var(--yellow)]"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 border-2 border-black bg-[var(--paper)] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold">{preset.label}</p>
              <span className="technical-label border border-black bg-white px-2 py-1">
                Auto-configured
              </span>
            </div>
            <div className="mt-4">
              <p className="technical-label text-[var(--slate)]">
                Exercise types
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preset.exerciseTypes.map((exercise) => (
                  <span
                    key={exercise.type}
                    className="technical-label border border-black bg-white px-2 py-1"
                  >
                    {getExerciseTypeLabel(exercise)}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="technical-label text-[var(--slate)]">
                Chords / {chordTypes.length}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chordTypes.map((chordType) => (
                  <span
                    key={chordType}
                    className="technical-label border border-black bg-white px-2 py-1"
                  >
                    {CHORD_DEFINITIONS[chordType].label}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="technical-label text-[var(--slate)]">
                Presentation
              </p>
              <p className="mt-1 text-sm font-medium">
                {playbackSummary(config.rcmLevel)}
              </p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="setup-label">02 / Time</legend>
            <div className="grid grid-cols-3 border-2 border-black">
              {SESSION_MODES.map((mode, index) => {
                const selected = config.sessionModeId === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        ...config,
                        sessionModeId: mode.id,
                      })
                    }
                    className={`min-h-12 text-sm font-semibold transition ${
                      index > 0 ? "border-l-2 border-black" : ""
                    } ${
                      selected
                        ? "bg-black text-white"
                        : "bg-white hover:bg-[var(--paper)]"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={onStart}
            className="mt-6 flex min-h-14 w-full items-center justify-between rounded-[6px] border-2 border-black bg-[var(--green)] px-5 font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--yellow)] active:translate-y-0"
          >
            <span className="inline-flex items-center gap-2">
              <AudioLines size={18} />
              Start listening
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-white">
              <ArrowRight size={17} />
            </span>
          </button>

          <div className="technical-label mt-4 flex items-center gap-2 text-[var(--slate)]">
            <Layers3 size={14} />
            Shared Salamander piano samples
          </div>
        </div>
      </LiquidCard>
    </main>
  );
}

