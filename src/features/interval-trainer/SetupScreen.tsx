import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AudioLines,
  Layers3,
  Music2,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import { SESSION_MODES } from "@/features/training/session";

import {
  INTERVAL_DEFINITIONS,
  INTERVAL_ORDER,
  INTERVAL_PLAYBACK_PATTERN_CONFIG,
  isCustomConfigValid,
  PRESENTATION_LABELS,
  PRODUCT_RCM_LEVEL_PRESETS,
  sortIntervalIds,
} from "./theory";
import type {
  IntervalId,
  IntervalPresentation,
  IntervalTrainerConfig,
  RcmLevel,
} from "./types";

interface SetupScreenProps {
  config: IntervalTrainerConfig;
  onChange: (config: IntervalTrainerConfig) => void;
  onStart: () => void;
}

const PRESENTATION_OPTIONS: {
  id: IntervalPresentation;
  icon: typeof ArrowUp;
}[] = [
  { id: "melodic-ascending", icon: ArrowUp },
  { id: "melodic-descending", icon: ArrowDown },
  { id: "harmonic", icon: Layers3 },
];

export function SetupScreen({
  config,
  onChange,
  onStart,
}: SetupScreenProps) {
  const preset = PRODUCT_RCM_LEVEL_PRESETS[config.rcmLevel];
  const canStart =
    config.setupMode === "rcm" || isCustomConfigValid(config);

  const toggleInterval = (intervalId: IntervalId) => {
    const selected = config.custom.intervals.includes(intervalId);
    onChange({
      ...config,
      custom: {
        ...config.custom,
        intervals: selected
          ? config.custom.intervals.filter((id) => id !== intervalId)
          : sortIntervalIds([...config.custom.intervals, intervalId]),
      },
    });
  };

  const togglePresentation = (
    presentation: IntervalPresentation,
  ) => {
    const selected = config.custom.presentations.includes(presentation);
    onChange({
      ...config,
      custom: {
        ...config.custom,
        presentations: selected
          ? config.custom.presentations.filter(
              (candidate) => candidate !== presentation,
            )
          : [...config.custom.presentations, presentation],
      },
    });
  };

  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-10 px-4 py-9 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:py-12">
      <section className="lg:col-span-5 lg:self-start lg:pt-10">
        <div className="technical-label mb-7 flex items-center gap-3">
          <span className="h-2.5 w-2.5 border border-black bg-[var(--orange)]" />
          Module 01 / Interval recognition
        </div>
        <h1 className="max-w-[650px] text-balance text-[clamp(4rem,8.5vw,8.3rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
          Train
          <span className="block">your musical</span>
          <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">
            ear.
          </span>
        </h1>
        <p className="mt-9 max-w-md text-pretty text-base leading-7 text-[var(--slate)] sm:text-lg sm:leading-8">
          Hear an interval first. Commit to an answer. Then reveal the
          notation and sharpen the connection between sound and score.
        </p>
        <div className="mt-10 grid max-w-md grid-cols-5 border-y border-black">
          {["Hear", "Answer", "Reveal", "Feedback", "Next"].map(
            (label, index) => (
              <div
                key={label}
                className={`py-3 ${index > 0 ? "border-l border-black pl-2 sm:pl-3" : ""}`}
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
              Choose your training
            </h2>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border-2 border-black bg-[var(--yellow)]">
            <Music2 size={21} strokeWidth={2.25} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <fieldset>
            <legend className="setup-label">01 / Training mode</legend>
            <div className="grid grid-cols-2 border-2 border-black">
              {(["rcm", "custom"] as const).map((mode, index) => {
                const selected = config.setupMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({ ...config, setupMode: mode })
                    }
                    className={`min-h-16 px-4 text-left transition ${
                      index > 0 ? "border-l-2 border-black" : ""
                    } ${
                      selected
                        ? "bg-black text-white"
                        : "bg-white hover:bg-[var(--yellow)]"
                    }`}
                  >
                    <span className="block font-semibold">
                      {mode === "rcm" ? "RCM Level" : "Custom"}
                    </span>
                    <span
                      className={`technical-label mt-1 block ${
                        selected ? "text-white/55" : "text-[var(--slate)]"
                      }`}
                    >
                      {mode === "rcm"
                        ? "Preset progression"
                        : "Build your own set"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {config.setupMode === "rcm" ? (
            <div className="mt-6">
              <fieldset>
                <legend className="setup-label">02 / Select a level</legend>
                <div className="grid grid-cols-5 border-l-2 border-t-2 border-black">
                  {Array.from({ length: 10 }, (_, index) => {
                    const level = (index + 1) as RcmLevel;
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
                            ? "bg-[var(--green)]"
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
                    Intervals / {preset.intervals.length}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sortIntervalIds(preset.intervals).map((intervalId) => (
                      <span
                        key={intervalId}
                        className="technical-label border border-black bg-white px-2 py-1"
                      >
                        {INTERVAL_DEFINITIONS[intervalId].label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="technical-label text-[var(--slate)]">
                    Presentation
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {
                      INTERVAL_PLAYBACK_PATTERN_CONFIG[
                        preset.playbackPattern
                      ].label
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <fieldset>
                <legend className="setup-label">
                  02 / Choose intervals
                </legend>
                <div className="grid grid-cols-2 border-l border-t border-black sm:grid-cols-3">
                  {INTERVAL_ORDER.map((intervalId) => {
                    const definition = INTERVAL_DEFINITIONS[intervalId];
                    const selected =
                      config.custom.intervals.includes(intervalId);
                    return (
                      <button
                        key={intervalId}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterval(intervalId)}
                        className={`flex min-h-12 items-center gap-2 border-b border-r border-black px-3 text-left transition ${
                          selected
                            ? "bg-[var(--green-soft)]"
                            : "bg-white hover:bg-[var(--yellow)]"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 shrink-0 border border-black ${
                            selected ? "bg-[var(--green)]" : "bg-white"
                          }`}
                        />
                        <span>
                          <span className="block text-sm font-semibold">
                            {definition.shortLabel}
                          </span>
                          <span className="technical-label block text-[var(--slate)]">
                            {definition.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="setup-label">
                  03 / Choose presentations
                </legend>
                <div className="grid grid-cols-1 border-2 border-black sm:grid-cols-3">
                  {PRESENTATION_OPTIONS.map(
                    ({ id, icon: Icon }, index) => {
                      const selected =
                        config.custom.presentations.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => togglePresentation(id)}
                          className={`flex min-h-12 items-center justify-center gap-2 px-3 text-xs font-semibold transition ${
                            index > 0
                              ? "border-t-2 border-black sm:border-l-2 sm:border-t-0"
                              : ""
                          } ${
                            selected
                              ? "bg-[var(--yellow)]"
                              : "bg-white hover:bg-[var(--paper)]"
                          }`}
                        >
                          <Icon size={15} />
                          {PRESENTATION_LABELS[id]}
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>
            </div>
          )}

          <fieldset className="mt-6">
            <legend className="setup-label">
              {config.setupMode === "rcm" ? "03" : "04"} / Time
            </legend>
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

          {!canStart && (
            <p
              role="alert"
              className="mt-4 border border-[var(--orange)] bg-[var(--orange-soft)] px-3 py-2 text-sm font-medium"
            >
              Choose at least one interval and one presentation.
            </p>
          )}

          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="mt-6 flex min-h-14 w-full items-center justify-between rounded-[6px] border-2 border-black bg-[var(--green)] px-5 font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--yellow)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <span className="inline-flex items-center gap-2">
              <AudioLines size={18} />
              Start listening
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-white">
              <ArrowRight size={17} />
            </span>
          </button>
        </div>
      </LiquidCard>
    </main>
  );
}
