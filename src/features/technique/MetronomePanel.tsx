"use client";

import { Pause, Play, Save, Target } from "lucide-react";
import { useEffect, useState } from "react";

import { startMetronome, stopMetronome } from "./metronomeAudio.ts";

interface MetronomePanelProps {
  bpm: number;
  volume: number;
  targetTempo?: number;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
  onSavePracticeTempo?: () => void;
  onMarkAchieved?: () => void;
}

export function MetronomePanel({
  bpm,
  volume,
  targetTempo,
  onBpmChange,
  onVolumeChange,
  onSavePracticeTempo,
  onMarkAchieved,
}: MetronomePanelProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    void startMetronome(bpm, volume);
    return stopMetronome;
  }, [bpm, playing, volume]);

  useEffect(() => stopMetronome, []);

  const setBpm = (value: number) =>
    onBpmChange(Math.max(30, Math.min(240, Math.round(value))));

  return (
    <aside
      aria-label="Persistent metronome"
      className="sticky bottom-3 z-30 rounded-[10px] border-2 border-black bg-[var(--yellow)] p-4 shadow-[5px_5px_0_#000]"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label={playing ? "Stop metronome" : "Start metronome"}
          onClick={() => setPlaying((value) => !value)}
          className="grid h-12 w-12 place-items-center rounded-[6px] border-2 border-black bg-black text-white"
        >
          {playing ? <Pause size={21} /> : <Play size={21} />}
        </button>
        <button
          type="button"
          aria-label="Decrease metronome tempo"
          onClick={() => setBpm(bpm - 1)}
          className="h-12 min-w-12 rounded-[6px] border-2 border-black bg-white text-xl font-bold"
        >
          −
        </button>
        <label className="min-w-28">
          <span className="technical-label block">Active BPM</span>
          <input
            aria-label="Active metronome BPM"
            type="number"
            min={30}
            max={240}
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
            className="mt-1 w-28 rounded-[5px] border-2 border-black bg-white px-3 py-2 text-2xl font-bold"
          />
        </label>
        <button
          type="button"
          aria-label="Increase metronome tempo"
          onClick={() => setBpm(bpm + 1)}
          className="h-12 min-w-12 rounded-[6px] border-2 border-black bg-white text-xl font-bold"
        >
          +
        </button>
        {targetTempo ? (
          <button
            type="button"
            onClick={() => setBpm(targetTempo)}
            className="inline-flex min-h-12 items-center gap-2 rounded-[6px] border-2 border-black bg-white px-4 font-semibold"
          >
            <Target size={18} />
            Target {targetTempo}
          </button>
        ) : null}
        <label className="ml-auto min-w-32">
          <span className="technical-label block">Volume</span>
          <input
            aria-label="Metronome volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="mt-2 w-32 accent-black"
          />
        </label>
      </div>
      {onSavePracticeTempo || onMarkAchieved ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-black pt-3">
          {onSavePracticeTempo ? (
            <button
              type="button"
              onClick={onSavePracticeTempo}
              className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-black bg-white px-4 font-semibold"
            >
              <Save size={17} />
              Set as practice tempo
            </button>
          ) : null}
          {onMarkAchieved ? (
            <button
              type="button"
              onClick={onMarkAchieved}
              className="min-h-11 rounded-[6px] border-2 border-black bg-[var(--green)] px-4 font-semibold"
            >
              Mark this tempo achieved
            </button>
          ) : null}
          <span className="self-center text-xs text-[var(--slate)]">
            Temporary BPM changes are not saved as technique progress.
          </span>
        </div>
      ) : null}
    </aside>
  );
}
