"use client";

import type { AccidentalMode } from "@/features/music/types";

import { getVisibleKeyLabel } from "./noteKeyboardLabels";

export interface NoteKeyboardSelection {
  keyId: string;
  pitchClass: number;
  label: string;
}

interface NoteKeyboardProps {
  accidentalMode: AccidentalMode;
  labelKeys: boolean;
  selectedKeyId: string | null;
  correctPitchClass?: number | null;
  disabled?: boolean;
  onSelect: (selection: NoteKeyboardSelection) => void;
}

interface PianoKey {
  id: string;
  pitchClass: number;
  naturalLabel?: string;
  sharpLabel?: string;
  flatLabel?: string;
  afterWhiteIndex?: number;
}

const WHITE_KEYS: readonly PianoKey[] = [
  { id: "c-left", pitchClass: 0, naturalLabel: "C" },
  { id: "d", pitchClass: 2, naturalLabel: "D" },
  { id: "e", pitchClass: 4, naturalLabel: "E" },
  { id: "f", pitchClass: 5, naturalLabel: "F" },
  { id: "g", pitchClass: 7, naturalLabel: "G" },
  { id: "a", pitchClass: 9, naturalLabel: "A" },
  { id: "b", pitchClass: 11, naturalLabel: "B" },
  { id: "c-right", pitchClass: 0, naturalLabel: "C" },
];

const BLACK_KEYS: readonly PianoKey[] = [
  {
    id: "c-sharp-d-flat",
    pitchClass: 1,
    sharpLabel: "C♯",
    flatLabel: "D♭",
    afterWhiteIndex: 0,
  },
  {
    id: "d-sharp-e-flat",
    pitchClass: 3,
    sharpLabel: "D♯",
    flatLabel: "E♭",
    afterWhiteIndex: 1,
  },
  {
    id: "f-sharp-g-flat",
    pitchClass: 6,
    sharpLabel: "F♯",
    flatLabel: "G♭",
    afterWhiteIndex: 3,
  },
  {
    id: "g-sharp-a-flat",
    pitchClass: 8,
    sharpLabel: "G♯",
    flatLabel: "A♭",
    afterWhiteIndex: 4,
  },
  {
    id: "a-sharp-b-flat",
    pitchClass: 10,
    sharpLabel: "A♯",
    flatLabel: "B♭",
    afterWhiteIndex: 5,
  },
];

function blackKeyLabel(
  key: PianoKey,
  accidentalMode: AccidentalMode,
): string {
  if (accidentalMode === "flats") return key.flatLabel ?? "";
  if (accidentalMode === "sharps") return key.sharpLabel ?? "";
  if (accidentalMode === "sharps-and-flats") {
    return `${key.sharpLabel}/${key.flatLabel}`;
  }
  return `${key.sharpLabel}/${key.flatLabel}`;
}

function keyStateClass(
  key: PianoKey,
  selectedKeyId: string | null,
  correctPitchClass: number | null | undefined,
  isBlack: boolean,
): string {
  const selected = selectedKeyId === key.id;
  const hasResult = correctPitchClass !== null && correctPitchClass !== undefined;
  const correct = hasResult && correctPitchClass === key.pitchClass;
  const incorrectSelected = hasResult && selected && !correct;

  if (correct && selected) {
    return "border-black bg-[var(--green)] text-black shadow-[inset_0_0_0_3px_var(--ink)]";
  }
  if (correct) {
    return "border-black bg-[var(--green-soft)] text-black";
  }
  if (incorrectSelected) {
    return "border-black bg-[var(--orange)] text-black";
  }
  if (selected) {
    return "border-black bg-[var(--yellow)] text-black";
  }
  return isBlack
    ? "border-black bg-black text-white hover:bg-[var(--slate)]"
    : "border-black bg-white text-black hover:bg-[var(--yellow)]";
}

export function NoteKeyboard({
  accidentalMode,
  labelKeys,
  selectedKeyId,
  correctPitchClass = null,
  disabled = false,
  onSelect,
}: NoteKeyboardProps) {
  const accidentalsEnabled = accidentalMode !== "naturals";

  return (
    <div
      className="relative mx-auto h-[clamp(150px,26vw,230px)] w-full max-w-[860px] select-none touch-manipulation"
      role="group"
      aria-label="One octave piano keyboard from C to C"
    >
      <div className="grid h-full grid-cols-8">
        {WHITE_KEYS.map((key, index) => (
          <button
            key={key.id}
            type="button"
            disabled={disabled}
            aria-label={`${key.naturalLabel} piano key`}
            aria-pressed={selectedKeyId === key.id}
            onClick={() =>
              onSelect({
                keyId: key.id,
                pitchClass: key.pitchClass,
                label: key.naturalLabel ?? "",
              })
            }
            className={`relative flex items-end justify-center border-2 pb-4 text-base font-semibold transition sm:pb-5 sm:text-lg ${
              index > 0 ? "border-l-0" : ""
            } ${keyStateClass(
              key,
              selectedKeyId,
              correctPitchClass,
              false,
            )} disabled:cursor-default`}
          >
            {getVisibleKeyLabel(key.naturalLabel ?? "", labelKeys) && (
              <span>{key.naturalLabel}</span>
            )}
          </button>
        ))}
      </div>

      {BLACK_KEYS.map((key) => {
        const label = blackKeyLabel(key, accidentalMode);
        const left = `${((key.afterWhiteIndex ?? 0) + 1) * 12.5}%`;

        return (
          <button
            key={key.id}
            type="button"
            disabled={disabled || !accidentalsEnabled}
            aria-label={`${label} piano key${
              accidentalsEnabled ? "" : ", unavailable"
            }`}
            aria-pressed={selectedKeyId === key.id}
            onClick={() =>
              onSelect({
                keyId: key.id,
                pitchClass: key.pitchClass,
                label,
              })
            }
            style={{
              left,
              width: "8.5%",
              transform: "translateX(-50%)",
            }}
            className={`absolute top-0 z-10 flex h-[62%] items-end justify-center rounded-b-[5px] border-2 px-0.5 pb-3 text-center text-[9px] font-semibold leading-tight transition sm:text-[11px] ${keyStateClass(
              key,
              selectedKeyId,
              correctPitchClass,
              true,
            )} disabled:cursor-default`}
          >
            {getVisibleKeyLabel(label, labelKeys) && (
              <span className="max-w-full break-words">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
