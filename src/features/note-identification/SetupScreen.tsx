import {
  ArrowRight,
  AudioLines,
  Music2,
  Piano,
  Volume2,
  VolumeX,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import { MusicRangeSlider } from "@/components/music/MusicRangeSlider";
import { CLEF_SUPPORTED_RANGES } from "@/features/music/noteGenerator";
import type {
  AccidentalMode,
  ClefSelection,
  MusicClef,
  NoteRange,
} from "@/features/music/types";
import { SESSION_MODES } from "@/features/training/session";

import {
  applyRangeShortcut,
  getActiveRangeShortcut,
  RANGE_SHORTCUTS,
  type RangeShortcutId,
} from "./config";
import type { NoteIdentificationConfig } from "./types";

interface SetupScreenProps {
  config: NoteIdentificationConfig;
  isAudioLoading: boolean;
  audioError: string | null;
  onChange: (config: NoteIdentificationConfig) => void;
  onStart: () => void;
}

const CLEF_OPTIONS: readonly {
  id: ClefSelection;
  label: string;
  detail: string;
}[] = [
  { id: "treble", label: "Treble", detail: "Upper staff" },
  { id: "bass", label: "Bass", detail: "Lower staff" },
  { id: "both", label: "Both", detail: "Mixed clefs" },
];

const ACCIDENTAL_OPTIONS: readonly {
  id: AccidentalMode;
  label: string;
}[] = [
  { id: "naturals", label: "Naturals only" },
  { id: "sharps", label: "Sharps" },
  { id: "flats", label: "Flats" },
  { id: "sharps-and-flats", label: "Sharps + flats" },
];

export function SetupScreen({
  config,
  isAudioLoading,
  audioError,
  onChange,
  onStart,
}: SetupScreenProps) {
  const selectClef = (clef: ClefSelection) => {
    onChange({
      ...config,
      clef,
    });
  };
  const activeShortcut = getActiveRangeShortcut(
    config.ranges,
    config.clef,
  );
  const visibleClefs: readonly MusicClef[] =
    config.clef === "both" ? ["treble", "bass"] : [config.clef];

  const selectShortcut = (shortcutId: RangeShortcutId) => {
    onChange({
      ...config,
      ranges: applyRangeShortcut(
        config.ranges,
        shortcutId,
        config.clef,
      ),
    });
  };

  const updateRange = (clef: MusicClef, range: NoteRange) => {
    onChange({
      ...config,
      ranges: {
        ...config.ranges,
        [clef]: range,
      },
    });
  };

  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-10 px-4 py-9 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:py-12">
      <section className="lg:col-span-5 lg:self-start lg:pt-10">
        <div className="technical-label mb-7 flex items-center gap-3">
          <span className="h-2.5 w-2.5 border border-black bg-[var(--yellow)]" />
          Module 02 / Note identification
        </div>
        <h1 className="max-w-[650px] text-balance text-[clamp(4rem,8.5vw,8.3rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
          Read
          <span className="block">the note.</span>
          <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">
            Play it.
          </span>
        </h1>
        <p className="mt-9 max-w-md text-pretty text-base leading-7 text-[var(--slate)] sm:text-lg sm:leading-8">
          Connect staff position, clef, and accidental to the piano key
          it represents. Octaves stay visible in the notation while your
          answer focuses on the note name.
        </p>
        <div className="mt-10 grid max-w-md grid-cols-4 border-y border-black">
          {["See", "Identify", "Feedback", "Next"].map((label, index) => (
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
          ))}
        </div>
      </section>

      <LiquidCard className="lg:col-span-7 lg:ml-5">
        <div className="flex items-start justify-between gap-4 border-b-2 border-black p-5 sm:p-6">
          <div>
            <p className="technical-label text-[var(--slate)]">
              Session configuration
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Choose your reading
            </h2>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border-2 border-black bg-[var(--yellow)]">
            <Music2 size={21} strokeWidth={2.25} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <fieldset>
            <legend className="setup-label">01 / Clef</legend>
            <div className="grid grid-cols-3 border-2 border-black">
              {CLEF_OPTIONS.map((option, index) => {
                const selected = config.clef === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectClef(option.id)}
                    className={`min-h-16 px-2 text-left transition sm:px-4 ${
                      index > 0 ? "border-l-2 border-black" : ""
                    } ${
                      selected
                        ? "bg-black text-white"
                        : "bg-white hover:bg-[var(--yellow)]"
                    }`}
                  >
                    <span className="block font-semibold">{option.label}</span>
                    <span
                      className={`technical-label mt-1 block ${
                        selected ? "text-white/55" : "text-[var(--slate)]"
                      }`}
                    >
                      {option.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="setup-label">02 / Note range</legend>
            <div className="grid grid-cols-2 border-l-2 border-t-2 border-black sm:grid-cols-4">
              {RANGE_SHORTCUTS.map((shortcut) => {
                const selected = activeShortcut === shortcut.id;
                return (
                  <button
                    key={shortcut.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectShortcut(shortcut.id)}
                    className={`min-h-14 border-b-2 border-r-2 border-black px-3 text-left transition ${
                      selected
                        ? "bg-[var(--green-soft)]"
                        : "bg-white hover:bg-[var(--yellow)]"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {shortcut.label}
                    </span>
                    <span className="technical-label mt-1 block text-[var(--slate)]">
                      {shortcut.detail}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4">
              {visibleClefs.map((clef) => (
                <MusicRangeSlider
                  key={clef}
                  clef={clef}
                  limits={CLEF_SUPPORTED_RANGES[clef]}
                  value={config.ranges[clef]}
                  onChange={(range) => updateRange(clef, range)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="setup-label">03 / Accidentals</legend>
            <div className="grid grid-cols-2 border-l-2 border-t-2 border-black sm:grid-cols-4">
              {ACCIDENTAL_OPTIONS.map((option) => {
                const selected = config.accidentalMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({
                        ...config,
                        accidentalMode: option.id,
                      })
                    }
                    className={`min-h-12 border-b-2 border-r-2 border-black px-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-[var(--yellow)]"
                        : "bg-white hover:bg-[var(--paper)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <fieldset>
              <legend className="setup-label">04 / Sound</legend>
              <div className="grid grid-cols-2 border-2 border-black">
                {[
                  { enabled: true, label: "On", icon: Volume2 },
                  { enabled: false, label: "Off", icon: VolumeX },
                ].map(({ enabled, label, icon: Icon }, index) => {
                  const selected = config.soundEnabled === enabled;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onChange({ ...config, soundEnabled: enabled })
                      }
                      className={`flex min-h-12 items-center justify-center gap-2 font-semibold transition ${
                        index > 0 ? "border-l-2 border-black" : ""
                      } ${
                        selected
                          ? "bg-black text-white"
                          : "bg-white hover:bg-[var(--paper)]"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="setup-label">05 / Label keys</legend>
              <div className="grid grid-cols-2 border-2 border-black">
                {[
                  { enabled: true, label: "On" },
                  { enabled: false, label: "Off" },
                ].map(({ enabled, label }, index) => {
                  const selected = config.labelKeys === enabled;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onChange({ ...config, labelKeys: enabled })
                      }
                      className={`min-h-12 font-semibold transition ${
                        index > 0 ? "border-l-2 border-black" : ""
                      } ${
                        selected
                          ? "bg-black text-white"
                          : "bg-white hover:bg-[var(--paper)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="setup-label">06 / Time</legend>
              <div className="grid grid-cols-3 border-2 border-black">
                {SESSION_MODES.map((mode, index) => {
                  const selected = config.sessionModeId === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      aria-label={mode.label}
                      aria-pressed={selected}
                      onClick={() =>
                        onChange({
                          ...config,
                          sessionModeId: mode.id,
                        })
                      }
                      className={`min-h-12 text-xs font-semibold transition ${
                        index > 0 ? "border-l-2 border-black" : ""
                      } ${
                        selected
                          ? "bg-black text-white"
                          : "bg-white hover:bg-[var(--paper)]"
                      }`}
                    >
                      <span
                        className={
                          mode.kind === "unlimited"
                            ? "text-2xl leading-none"
                            : "text-base leading-none"
                        }
                      >
                        {mode.kind === "unlimited"
                          ? "∞"
                          : `${mode.durationSeconds / 60}:00`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={isAudioLoading}
            className="mt-6 flex min-h-14 w-full items-center justify-between rounded-[6px] border-2 border-black bg-[var(--green)] px-5 font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--yellow)] active:translate-y-0 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-55"
          >
            <span className="inline-flex items-center gap-2">
              {config.soundEnabled ? (
                <AudioLines size={18} />
              ) : (
                <Piano size={18} />
              )}
              {isAudioLoading ? "Loading piano…" : "Start reading"}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-white">
              <ArrowRight size={17} />
            </span>
          </button>
          {audioError && config.soundEnabled && (
            <p
              role="alert"
              className="mt-3 border border-[var(--orange)] bg-[var(--orange-soft)] px-3 py-2 text-sm font-medium"
            >
              {audioError}
            </p>
          )}
        </div>
      </LiquidCard>
    </main>
  );
}
