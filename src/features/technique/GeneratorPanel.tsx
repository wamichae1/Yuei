"use client";

import {
  Dices,
  Pencil,
  Play,
  RefreshCw,
  Replace,
  Save,
  Shuffle,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PRACTICE_GROUP_LABELS } from "./data.ts";
import {
  generateBySetCount,
  generateCustomSets,
  replaceTechnique,
} from "./generator.ts";
import type {
  SavedPracticeSet,
  TechniqueDefinition,
  TechniquePracticeGroup,
} from "./types.ts";

export interface DraftPracticeSet {
  id: string;
  name: string;
  level: SavedPracticeSet["level"];
  techniqueDefinitionIds: string[];
}

interface GeneratorPanelProps {
  definitions: readonly TechniqueDefinition[];
  level: SavedPracticeSet["level"];
  drafts: DraftPracticeSet[];
  onDraftsChange: (sets: DraftPracticeSet[]) => void;
  onSave: (set: DraftPracticeSet) => void;
  onPractice: (set: DraftPracticeSet) => void;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `set-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function GeneratorPanel({
  definitions,
  level,
  drafts,
  onDraftsChange,
  onSave,
  onPractice,
}: GeneratorPanelProps) {
  const [mode, setMode] = useState<"sets" | "custom">("sets");
  const [setCount, setSetCount] = useState(4);
  const practiceGroups = useMemo(
    () => [...new Set(definitions.map((item) => item.practiceGroup))],
    [definitions],
  );
  const [practiceGroupCounts, setPracticeGroupCounts] = useState<
    Partial<Record<TechniquePracticeGroup, number>>
  >({});

  const generate = () => {
    const generated =
      mode === "sets"
        ? generateBySetCount({ definitions, level, setCount })
        : generateCustomSets({
            definitions,
            level,
            setCount,
            practiceGroupCounts,
          });
    onDraftsChange(
      generated.map((ids, index) => ({
        id: createId(),
        name: `Level ${level} Practice Set ${index + 1}`,
        level,
        techniqueDefinitionIds: ids,
      })),
    );
  };

  return (
    <section>
      <div className="grid gap-5 border-b-2 border-black pb-6 md:grid-cols-2">
        <div>
          <p className="setup-label">Generation mode</p>
          <div className="grid grid-cols-2 border-l-2 border-t-2 border-black">
            {(["sets", "custom"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`min-h-16 border-b-2 border-r-2 border-black px-3 font-semibold ${mode === value ? "bg-[var(--orange)]" : "bg-white"}`}
              >
                {value === "sets" ? "By number of sets" : "Custom mix"}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span className="setup-label">How many practice sets?</span>
          <input
            type="number"
            min={1}
            max={20}
            value={setCount}
            onChange={(event) =>
              setSetCount(Math.max(1, Number(event.target.value)))
            }
            className="min-h-16 w-full rounded-[6px] border-2 border-black bg-white px-4 text-2xl font-bold"
          />
        </label>
      </div>

      {mode === "custom" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {practiceGroups.map((group) => (
            <label key={group} className="border-2 border-black bg-white p-3">
              <span className="technical-label block">
                {PRACTICE_GROUP_LABELS[group]}
              </span>
              <input
                aria-label={`${PRACTICE_GROUP_LABELS[group]} per set`}
                type="number"
                min={0}
                value={practiceGroupCounts[group] ?? 0}
                onChange={(event) =>
                  setPracticeGroupCounts((current) => ({
                    ...current,
                    [group]: Math.max(0, Number(event.target.value)),
                  }))
                }
                className="mt-2 w-full border-b-2 border-black bg-transparent py-1 text-2xl font-bold"
              />
            </label>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={generate}
        disabled={definitions.length === 0}
        className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[6px] border-2 border-black bg-black px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Dices size={19} />
        Generate balanced sets
      </button>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {drafts.map((set, setIndex) => (
          <article key={set.id} className="border-2 border-black bg-white">
            <div className="flex items-center gap-3 border-b-2 border-black p-4">
              <Pencil size={17} />
              <input
                aria-label={`Name for practice set ${setIndex + 1}`}
                value={set.name}
                onChange={(event) =>
                  onDraftsChange(
                    drafts.map((value) =>
                      value.id === set.id
                        ? { ...value, name: event.target.value }
                        : value,
                    ),
                  )
                }
                className="min-w-0 flex-1 border-b border-black bg-transparent py-1 text-lg font-bold"
              />
              <button
                type="button"
                aria-label={`Delete ${set.name}`}
                onClick={() =>
                  onDraftsChange(drafts.filter((value) => value.id !== set.id))
                }
                className="grid h-10 w-10 place-items-center border-2 border-black bg-white"
              >
                <Trash2 size={17} />
              </button>
            </div>
            <ol className="divide-y divide-black">
              {set.techniqueDefinitionIds.map((id, index) => {
                const definition = definitions.find((item) => item.id === id);
                return (
                  <li
                    key={`${id}-${index}`}
                    className="flex min-h-12 items-center gap-3 px-4 py-2"
                  >
                    <span className="technical-label w-5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold">
                      {definition?.displayName ?? `Missing definition: ${id}`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Replace ${definition?.displayName ?? id}`}
                      onClick={() =>
                        onDraftsChange(
                          drafts.map((value) =>
                            value.id === set.id
                              ? {
                                  ...value,
                                  techniqueDefinitionIds: replaceTechnique(
                                    value.techniqueDefinitionIds,
                                    id,
                                    definitions,
                                  ),
                                }
                              : value,
                          ),
                        )
                      }
                      className="grid h-9 w-9 place-items-center border border-black bg-white"
                    >
                      <Replace size={15} />
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-wrap gap-2 border-t-2 border-black p-3">
              <button
                type="button"
                onClick={() =>
                  onDraftsChange(
                    drafts.map((value) =>
                      value.id === set.id
                        ? {
                            ...value,
                            techniqueDefinitionIds: [
                              ...value.techniqueDefinitionIds,
                            ].sort(() => Math.random() - 0.5),
                          }
                        : value,
                    ),
                  )
                }
                className="inline-flex min-h-10 items-center gap-2 border-2 border-black bg-white px-3 text-sm font-semibold"
              >
                <Shuffle size={15} /> Shuffle
              </button>
              <button
                type="button"
                onClick={() => {
                  const regenerated = generateBySetCount({
                    definitions,
                    level,
                    setCount: 1,
                  })[0];
                  onDraftsChange(
                    drafts.map((value) =>
                      value.id === set.id
                        ? { ...value, techniqueDefinitionIds: regenerated }
                        : value,
                    ),
                  );
                }}
                className="inline-flex min-h-10 items-center gap-2 border-2 border-black bg-white px-3 text-sm font-semibold"
              >
                <RefreshCw size={15} /> Regenerate
              </button>
              <button
                type="button"
                onClick={() => onSave(set)}
                className="inline-flex min-h-10 items-center gap-2 border-2 border-black bg-[var(--yellow)] px-3 text-sm font-semibold"
              >
                <Save size={15} /> Save
              </button>
              <button
                type="button"
                onClick={() => onPractice(set)}
                className="ml-auto inline-flex min-h-10 items-center gap-2 border-2 border-black bg-black px-3 text-sm font-semibold text-white"
              >
                <Play size={15} /> Practice set
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
