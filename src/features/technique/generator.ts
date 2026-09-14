import type {
  GenerationStrategy,
  TechniqueDefinition,
  TechniquePracticeGroup,
} from "./types.ts";

export interface GenerateBySetCountOptions {
  definitions: readonly TechniqueDefinition[];
  level: number;
  setCount: number;
  strategy?: Extract<GenerationStrategy, "balanced" | "random">;
  random?: () => number;
}

export interface GenerateCustomSetOptions {
  definitions: readonly TechniqueDefinition[];
  level: number;
  practiceGroupCounts: Partial<Record<TechniquePracticeGroup, number>>;
  setCount?: number;
  strategy?: Extract<GenerationStrategy, "balanced" | "random">;
  random?: () => number;
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function eligible(
  definitions: readonly TechniqueDefinition[],
  level: number,
) {
  return definitions.filter((definition) => definition.level === level);
}

export function generateBySetCount({
  definitions,
  level,
  setCount,
  strategy = "balanced",
  random = Math.random,
}: GenerateBySetCountOptions): string[][] {
  const count = Math.max(1, Math.floor(setCount));
  const pool = eligible(definitions, level);
  const sets = Array.from({ length: count }, () => [] as string[]);
  if (pool.length === 0) return sets;

  if (strategy === "random") {
    shuffled(pool, random).forEach((definition, index) => {
      sets[index % count].push(definition.id);
    });
    return sets;
  }

  const byGroup = new Map<
    TechniquePracticeGroup,
    TechniqueDefinition[]
  >();
  for (const definition of pool) {
    const values = byGroup.get(definition.practiceGroup) ?? [];
    values.push(definition);
    byGroup.set(definition.practiceGroup, values);
  }
  let cursor = 0;
  for (const values of byGroup.values()) {
    for (const definition of shuffled(values, random)) {
      sets[cursor % count].push(definition.id);
      cursor += 1;
    }
  }
  return sets;
}

export function generateCustomSets({
  definitions,
  level,
  practiceGroupCounts,
  setCount = 1,
  random = Math.random,
}: GenerateCustomSetOptions): string[][] {
  const count = Math.max(1, Math.floor(setCount));
  const pool = eligible(definitions, level);
  const sets = Array.from({ length: count }, () => [] as string[]);
  const groupPools = new Map<
    TechniquePracticeGroup,
    TechniqueDefinition[]
  >();
  for (const definition of pool) {
    const values = groupPools.get(definition.practiceGroup) ?? [];
    values.push(definition);
    groupPools.set(definition.practiceGroup, values);
  }

  for (const [group, requested] of Object.entries(practiceGroupCounts) as [
    TechniquePracticeGroup,
    number,
  ][]) {
    const available = shuffled(groupPools.get(group) ?? [], random);
    const wanted = Math.max(0, Math.floor(requested ?? 0));
    if (wanted === 0 || available.length === 0) continue;
    let cursor = 0;
    for (const set of sets) {
      for (let index = 0; index < wanted; index += 1) {
        const candidate = available[cursor % available.length];
        if (!set.includes(candidate.id) || available.length <= wanted) {
          set.push(candidate.id);
        }
        cursor += 1;
      }
    }
  }
  return sets;
}

export function replaceTechnique(
  setIds: readonly string[],
  replacedId: string,
  definitions: readonly TechniqueDefinition[],
  random: () => number = Math.random,
): string[] {
  const replaced = definitions.find((item) => item.id === replacedId);
  if (!replaced) return [...setIds];
  const candidates = definitions.filter(
    (item) =>
      item.level === replaced.level &&
      item.category === replaced.category &&
      item.id !== replacedId &&
      !setIds.includes(item.id),
  );
  if (candidates.length === 0) return [...setIds];
  const replacement = candidates[Math.floor(random() * candidates.length)];
  return setIds.map((id) => (id === replacedId ? replacement.id : id));
}
