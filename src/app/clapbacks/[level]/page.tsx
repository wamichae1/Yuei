import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LevelModulePage } from "@/features/level-training/LevelModulePage";
import {
  CLAPBACKS_MODULE,
  getTrainingLevel,
} from "@/features/level-training/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return CLAPBACKS_MODULE.levels.map(({ level }) => ({
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
    title: `Yuei · Clapbacks Level ${level}`,
    description: `Clapbacks Level ${level}. Exercises coming soon.`,
  };
}

export default async function ClapbacksLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelParam } = await params;
  const level = getTrainingLevel(CLAPBACKS_MODULE, levelParam);

  if (!level) {
    notFound();
  }

  return (
    <LevelModulePage
      module={CLAPBACKS_MODULE}
      selectedLevel={level}
    />
  );
}
