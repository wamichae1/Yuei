"use client";

import { Bookmark, Play } from "lucide-react";
import { useMemo, useState } from "react";

import {
  CATEGORY_LABELS,
  formatTargetTempo,
  getTechniqueFacts,
} from "./data.ts";
import { isAtTarget, tempoProgress } from "./tempo.ts";
import type {
  TechniqueCategory,
  TechniqueDefinition,
  TechniqueProgress,
} from "./types.ts";

interface RequirementsPanelProps {
  definitions: readonly TechniqueDefinition[];
  progress: Record<string, TechniqueProgress>;
  onSelect: (id: string) => void;
  onToggleReview: (id: string) => void;
}

export function RequirementsPanel({
  definitions,
  progress,
  onSelect,
  onToggleReview,
}: RequirementsPanelProps) {
  const [category, setCategory] = useState<TechniqueCategory | "all">("all");
  const [tonality, setTonality] = useState<"all" | "major" | "minor">("all");
  const [progressFilter, setProgressFilter] = useState<
    "all" | "not_practiced" | "below_target" | "at_target" | "review"
  >("all");
  const categories = useMemo(
    () => [...new Set(definitions.map((item) => item.category))],
    [definitions],
  );
  const filtered = definitions.filter((definition) => {
    const itemProgress = progress[definition.id];
    return (
      (category === "all" || definition.category === category) &&
      (tonality === "all" || definition.tonality === tonality) &&
      (progressFilter === "all" ||
        (progressFilter === "not_practiced" && !itemProgress?.lastPracticedAt) ||
        (progressFilter === "below_target" &&
          !isAtTarget(
            itemProgress?.currentPracticeTempo,
            definition.tempo.bpm,
          )) ||
        (progressFilter === "at_target" &&
          isAtTarget(
            itemProgress?.currentPracticeTempo,
            definition.tempo.bpm,
          )) ||
        (progressFilter === "review" && itemProgress?.markedForReview))
    );
  });

  return (
    <section>
      <div className="grid gap-3 border-b-2 border-black pb-5 sm:grid-cols-3">
        <FilterSelect
          label="Category"
          value={category}
          onChange={(value) => setCategory(value as typeof category)}
          options={[
            ["all", "All categories"],
            ...categories.map(
              (value) => [value, CATEGORY_LABELS[value]] as const,
            ),
          ]}
        />
        <FilterSelect
          label="Tonality"
          value={tonality}
          onChange={(value) => setTonality(value as typeof tonality)}
          options={[
            ["all", "Major & minor"],
            ["major", "Major"],
            ["minor", "Minor"],
          ]}
        />
        <FilterSelect
          label="Progress"
          value={progressFilter}
          onChange={(value) =>
            setProgressFilter(value as typeof progressFilter)
          }
          options={[
            ["all", "All progress"],
            ["not_practiced", "Not practiced"],
            ["below_target", "Below target"],
            ["at_target", "At target"],
            ["review", "Needs review"],
          ]}
        />
      </div>
      <div className="mt-5 space-y-6">
        {categories.map((group) => {
          const items = filtered.filter((item) => item.category === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <h3 className="technical-label mb-2">{CATEGORY_LABELS[group]}</h3>
              <div className="border-l-2 border-t-2 border-black">
                {items.map((definition) => {
                  const itemProgress = progress[definition.id];
                  const atTarget = isAtTarget(
                    itemProgress?.currentPracticeTempo,
                    definition.tempo.bpm,
                  );
                  return (
                    <article
                      key={definition.id}
                      className="grid gap-4 border-b-2 border-r-2 border-black bg-white p-4 md:grid-cols-[1fr_220px_auto]"
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(definition.id)}
                        className="min-w-0 text-left"
                      >
                        <h4 className="text-lg font-bold">
                          {definition.displayName}
                        </h4>
                        <p className="mt-1 text-sm text-[var(--slate)]">
                          {getTechniqueFacts(definition).join(" • ")}
                        </p>
                        {definition.alternatives?.map((alternative) => (
                          <p
                            key={alternative.id}
                            className="mt-2 text-xs font-semibold"
                          >
                            Permitted alternative: {alternative.label} —{" "}
                            {alternative.description}
                          </p>
                        ))}
                      </button>
                      <div>
                        <p className="text-sm">
                          Current:{" "}
                          <strong>
                            {itemProgress?.currentPracticeTempo
                              ? `${itemProgress.currentPracticeTempo} BPM`
                              : "Not set"}
                          </strong>
                        </p>
                        <p className="text-sm">
                          RCM target:{" "}
                          <strong>{formatTargetTempo(definition)}</strong>
                        </p>
                        <div
                          aria-label={`Tempo progress ${tempoProgress(itemProgress?.currentPracticeTempo, definition.tempo.bpm)} percent`}
                          className="mt-2 h-2 overflow-hidden border border-black bg-[var(--paper)]"
                        >
                          <div
                            className="h-full bg-[var(--green)]"
                            style={{
                              width: `${tempoProgress(itemProgress?.currentPracticeTempo, definition.tempo.bpm)}%`,
                            }}
                          />
                        </div>
                        <p className="technical-label mt-1">
                          {atTarget ? "At target tempo" : "Tempo progress"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Toggle needs review for ${definition.displayName}`}
                          onClick={() => onToggleReview(definition.id)}
                          className={`grid h-11 w-11 place-items-center rounded-[6px] border-2 border-black ${itemProgress?.markedForReview ? "bg-[var(--orange)]" : "bg-white"}`}
                        >
                          <Bookmark size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelect(definition.id)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-black bg-black px-4 font-semibold text-white"
                        >
                          <Play size={17} />
                          Practice
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label>
      <span className="setup-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-[6px] border-2 border-black bg-white px-3"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
