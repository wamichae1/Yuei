import type {
  SavedPracticeSet,
  TechniqueProgress,
  TechniqueStoreData,
} from "./types.ts";

export const TECHNIQUE_STORAGE_KEY = "yuei.technique.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const DEFAULT_TECHNIQUE_STORE: TechniqueStoreData = {
  version: 1,
  progress: {},
  savedSets: [],
  metronome: { bpm: 80, volume: 0.65 },
};

export function loadTechniqueStore(
  storage: StorageLike,
): TechniqueStoreData {
  try {
    const value = storage.getItem(TECHNIQUE_STORAGE_KEY);
    if (!value) return structuredClone(DEFAULT_TECHNIQUE_STORE);
    const parsed = JSON.parse(value) as Partial<TechniqueStoreData>;
    return {
      ...structuredClone(DEFAULT_TECHNIQUE_STORE),
      ...parsed,
      version: 1,
      progress: parsed.progress ?? {},
      savedSets: parsed.savedSets ?? [],
      metronome: {
        ...DEFAULT_TECHNIQUE_STORE.metronome,
        ...parsed.metronome,
      },
    };
  } catch {
    return structuredClone(DEFAULT_TECHNIQUE_STORE);
  }
}

export function saveTechniqueStore(
  storage: StorageLike,
  data: TechniqueStoreData,
) {
  storage.setItem(TECHNIQUE_STORAGE_KEY, JSON.stringify(data));
}

export function upsertTechniqueProgress(
  data: TechniqueStoreData,
  techniqueDefinitionId: string,
  patch: Partial<TechniqueProgress>,
): TechniqueStoreData {
  const previous = data.progress[techniqueDefinitionId] ?? {
    techniqueDefinitionId,
  };
  return {
    ...data,
    progress: {
      ...data.progress,
      [techniqueDefinitionId]: {
        ...previous,
        ...patch,
        techniqueDefinitionId,
      },
    },
  };
}

export function savePracticeSet(
  data: TechniqueStoreData,
  set: SavedPracticeSet,
): TechniqueStoreData {
  const index = data.savedSets.findIndex((value) => value.id === set.id);
  const savedSets = [...data.savedSets];
  if (index >= 0) savedSets[index] = set;
  else savedSets.push(set);
  return { ...data, savedSets };
}

export function deletePracticeSet(
  data: TechniqueStoreData,
  setId: string,
): TechniqueStoreData {
  return {
    ...data,
    savedSets: data.savedSets.filter((set) => set.id !== setId),
  };
}
