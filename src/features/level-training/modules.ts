export const LEVEL_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] as const;

export type TrainingLevel = (typeof LEVEL_NUMBERS)[number];

export type Exercise = {
  id: string;
};

export type Level = {
  level: TrainingLevel;
  exercises: readonly Exercise[];
};

export type LevelModuleDefinition = {
  slug: "clapbacks" | "playbacks";
  number: "04" | "05";
  title: string;
  description: string;
  systemLabel: string;
  footerLabel: string;
  levels: readonly Level[];
};

function createEmptyLevels(): readonly Level[] {
  return LEVEL_NUMBERS.map((level) => ({
    level,
    exercises: [],
  }));
}

export const CLAPBACKS_MODULE: LevelModuleDefinition = {
  slug: "clapbacks",
  number: "04",
  title: "Clapbacks",
  description: "Practice rhythmic and musical clapback exercises.",
  systemLabel: "Rhythm-training system / Clapbacks 04",
  footerLabel: "Listen / Echo / Internalize",
  levels: createEmptyLevels(),
};

export const PLAYBACKS_MODULE: LevelModuleDefinition = {
  slug: "playbacks",
  number: "05",
  title: "Playbacks",
  description: "Practice playback exercises.",
  systemLabel: "Music-training system / Playbacks 05",
  footerLabel: "Hear / Remember / Reproduce",
  levels: createEmptyLevels(),
};

export function getTrainingLevel(
  module: LevelModuleDefinition,
  value: string,
): Level | undefined {
  return module.levels.find((level) => String(level.level) === value);
}
