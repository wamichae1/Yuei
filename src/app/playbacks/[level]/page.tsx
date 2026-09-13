import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LevelModulePage } from "@/features/level-training/LevelModulePage";
import {
  getTrainingLevel,
  PLAYBACKS_MODULE,
} from "@/features/level-training/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return PLAYBACKS_MODULE.levels.map(({ level }) => ({
    level: String(level),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ level: string }>;
}): Promise<Metadata> {
  const { level } = await params;

  return {
    title: `Yuei · Playbacks Level ${level}`,
    description: `Playbacks Level ${level}. Exercises coming soon.`,
  };
}

export default async function PlaybacksLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelParam } = await params;
  const level = getTrainingLevel(PLAYBACKS_MODULE, levelParam);

  if (!level) {
    notFound();
  }

  return (
    <LevelModulePage
      module={PLAYBACKS_MODULE}
      selectedLevel={level}
    />
  );
}
