"use client";

import { ArrowLeft, Bookmark, Dumbbell, Play, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";
import { LEVEL_NUMBERS, type TrainingLevel } from "@/features/level-training/modules";

import { getTechniqueById, getTechniquesForLevel, RCM_TECHNIQUE_DATA_NOTICE, RCM_TECHNIQUE_DEFINITIONS } from "./data.ts";
import { type DraftPracticeSet, GeneratorPanel } from "./GeneratorPanel.tsx";
import { MetronomePanel } from "./MetronomePanel.tsx";
import { PracticeSession } from "./PracticeSession.tsx";
import { RequirementsPanel } from "./RequirementsPanel.tsx";
import { deletePracticeSet, savePracticeSet, upsertTechniqueProgress } from "./storage.ts";
import type { SavedPracticeSet, TechniqueProgress } from "./types.ts";
import { useTechniqueStore } from "./useTechniqueStore.ts";

type View = "requirements" | "generator" | "saved";

export function TechniquePracticeApp() {
  const { data, setData, loaded } = useTechniqueStore();
  const [level, setLevel] = useState<TrainingLevel>(1);
  const [view, setView] = useState<View>("requirements");
  const [drafts, setDrafts] = useState<DraftPracticeSet[]>([]);
  const [activeSet, setActiveSet] = useState<{ name: string; ids: string[] } | null>(null);
  const levelDefinitions = useMemo(() => getTechniquesForLevel(level), [level]);

  const updateProgress = (id: string, patch: Partial<TechniqueProgress>) =>
    setData((current) => upsertTechniqueProgress(current, id, patch));

  const beginPractice = (name: string, ids: string[]) => {
    const first = ids.map(getTechniqueById).find(Boolean);
    if (first) {
      setData((current) => ({
        ...current,
        progress: {
          ...current.progress,
          [first.id]: {
            ...current.progress[first.id],
            techniqueDefinitionId: first.id,
            lastPracticedAt: new Date().toISOString(),
            totalPracticeSessions:
              (current.progress[first.id]?.totalPracticeSessions ?? 0) + 1,
          },
        },
        metronome: {
          ...current.metronome,
          bpm: current.progress[first.id]?.currentPracticeTempo ?? first.tempo.bpm,
        },
      }));
    }
    setActiveSet({ name, ids });
  };

  if (activeSet) {
    const definitions = activeSet.ids.map(getTechniqueById).filter((value) => value !== undefined);
    return (
      <PracticeSession
        name={activeSet.name}
        definitions={definitions}
        progress={data.progress}
        bpm={data.metronome.bpm}
        volume={data.metronome.volume}
        onBpmChange={(bpm) => setData((current) => ({ ...current, metronome: { ...current.metronome, bpm } }))}
        onVolumeChange={(volume) => setData((current) => ({ ...current, metronome: { ...current.metronome, volume } }))}
        onProgress={updateProgress}
        onClose={() => setActiveSet(null)}
      />
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div aria-hidden="true" className="editorial-grid pointer-events-none absolute inset-0 opacity-35" />
      <header className="relative z-10 border-b-2 border-black bg-[var(--paper)]">
        <nav className="mx-auto flex h-20 w-full max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Return to Yuei.AI training home" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[6px] border-2 border-black bg-[var(--orange)]"><Dumbbell size={19} /></span>
            <span className="text-xl font-bold tracking-[-0.055em]">Yuei<span className="text-[var(--green)]">.</span></span>
          </Link>
          <span className="technical-label ml-auto hidden text-[var(--slate)] sm:block">RCM technique / Levels 01–10</span>
          <span className="technical-label rounded-[5px] border border-black bg-black px-3 py-2 text-white">Local practice</span>
        </nav>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 border-b-2 border-black pb-8 lg:grid-cols-[1fr_460px]">
          <div>
            <p className="technical-label mb-5">Module 06 / Technique</p>
            <h1 className="text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
              RCM technique
              <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">practice.</span>
            </h1>
          </div>
          <div className="self-end">
            <p className="text-base leading-7 text-[var(--slate)]">
              Review requirements, generate balanced sets, save exact exercise lists, and develop a persistent working tempo toward each official target.
            </p>
            <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 border-2 border-black bg-white px-4 font-semibold">
              <ArrowLeft size={17} /> Back to training
            </Link>
          </div>
        </section>

        {RCM_TECHNIQUE_DEFINITIONS.length === 0 ? (
          <div role="status" className="mt-6 border-2 border-black bg-[var(--orange-soft)] p-4">
            <strong className="block">Canonical technique data required</strong>
            <p className="mt-1 text-sm leading-6">{RCM_TECHNIQUE_DATA_NOTICE}</p>
          </div>
        ) : null}

        <section className="mt-7">
          <p className="setup-label">01 / Select RCM level</p>
          <div className="grid grid-cols-5 border-l-2 border-t-2 border-black sm:grid-cols-10">
            {LEVEL_NUMBERS.map((value) => (
              <button key={value} type="button" aria-label={`RCM Level ${value}`} onClick={() => { setLevel(value); setDrafts([]); }}
                className={`min-h-14 border-b-2 border-r-2 border-black font-bold ${level === value ? "bg-[var(--orange)]" : "bg-white"}`}>
                {value}
              </button>
            ))}
          </div>
        </section>

        <LiquidCard className="mt-6">
          <div className="flex flex-wrap items-center gap-3 border-b-2 border-black p-4 sm:p-5">
            <div>
              <p className="technical-label text-[var(--slate)]">Selected level</p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em]">RCM Level {level}</h2>
            </div>
            <div role="tablist" aria-label="Technique sections" className="ml-auto flex flex-wrap border-l-2 border-t-2 border-black">
              {([
                ["requirements", "Requirements"],
                ["generator", "Generate sets"],
                ["saved", `Saved (${data.savedSets.length})`],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => setView(value)}
                  className={`min-h-11 border-b-2 border-r-2 border-black px-3 font-semibold ${view === value ? "bg-[var(--yellow)]" : "bg-white"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {!loaded ? <p>Loading local practice data…</p> : view === "requirements" ? (
              levelDefinitions.length ? (
                <RequirementsPanel
                  definitions={levelDefinitions}
                  progress={data.progress}
                  onSelect={(id) => beginPractice(getTechniqueById(id)?.displayName ?? "Technique practice", [id])}
                  onToggleReview={(id) => updateProgress(id, { markedForReview: !data.progress[id]?.markedForReview })}
                />
              ) : <EmptyPool level={level} />
            ) : view === "generator" ? (
              levelDefinitions.length ? (
                <GeneratorPanel
                  definitions={levelDefinitions}
                  level={level}
                  drafts={drafts}
                  onDraftsChange={setDrafts}
                  onSave={(draft) => {
                    const now = new Date().toISOString();
                    setData((current) => savePracticeSet(current, {
                      ...draft,
                      createdAt: current.savedSets.find((set) => set.id === draft.id)?.createdAt ?? now,
                      updatedAt: now,
                    }));
                  }}
                  onPractice={(draft) => beginPractice(draft.name, draft.techniqueDefinitionIds)}
                />
              ) : <EmptyPool level={level} />
            ) : (
              <SavedSets
                sets={data.savedSets}
                onRename={(set, name) => setData((current) => savePracticeSet(current, { ...set, name, updatedAt: new Date().toISOString() }))}
                onDelete={(id) => setData((current) => deletePracticeSet(current, id))}
                onPractice={(set) => beginPractice(set.name, set.techniqueDefinitionIds)}
              />
            )}
          </div>
        </LiquidCard>

        <div className="mt-6">
          <MetronomePanel
            bpm={data.metronome.bpm}
            volume={data.metronome.volume}
            onBpmChange={(bpm) => setData((current) => ({ ...current, metronome: { ...current.metronome, bpm } }))}
            onVolumeChange={(volume) => setData((current) => ({ ...current, metronome: { ...current.metronome, volume } }))}
          />
        </div>
      </main>
    </div>
  );
}

function EmptyPool({ level }: { level: number }) {
  return (
    <div className="border-2 border-black bg-[var(--paper)] p-6 text-center">
      <Bookmark className="mx-auto" size={30} />
      <h3 className="mt-3 text-2xl font-bold">No verified Level {level} definitions</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--slate)]">
        Add canonical definitions to the centralized technique database. All requirements, filters, generation, sessions, and progress controls derive from that data automatically.
      </p>
    </div>
  );
}

function SavedSets({ sets, onRename, onDelete, onPractice }: {
  sets: readonly SavedPracticeSet[];
  onRename: (set: SavedPracticeSet, name: string) => void;
  onDelete: (id: string) => void;
  onPractice: (set: SavedPracticeSet) => void;
}) {
  if (!sets.length) {
    return <div className="border-2 border-black bg-[var(--paper)] p-6 text-center"><Save className="mx-auto" size={30} /><h3 className="mt-3 text-2xl font-bold">No saved practice sets</h3></div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sets.map((set) => (
        <article key={set.id} className="border-2 border-black bg-white p-4">
          <p className="technical-label">RCM Level {set.level}</p>
          <input aria-label={`Rename ${set.name}`} value={set.name} onChange={(event) => onRename(set, event.target.value)}
            className="mt-1 w-full border-b-2 border-black bg-transparent py-1 text-xl font-bold" />
          <p className="mt-3 text-sm text-[var(--slate)]">{set.techniqueDefinitionIds.length} exercises · exact saved order</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => onPractice(set)} disabled={set.techniqueDefinitionIds.length === 0}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-black bg-black px-4 font-semibold text-white disabled:opacity-30">
              <Play size={16} /> Practice
            </button>
            <button type="button" aria-label={`Delete ${set.name}`} onClick={() => onDelete(set.id)}
              className="grid h-11 w-11 place-items-center border-2 border-black bg-white"><Trash2 size={17} /></button>
          </div>
        </article>
      ))}
    </div>
  );
}
