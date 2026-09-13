import type { Metadata } from "next";

import { LevelModulePage } from "@/features/level-training/LevelModulePage";
import { PLAYBACKS_MODULE } from "@/features/level-training/modules";

export const metadata: Metadata = {
  title: "Yuei · Playbacks",
  description: PLAYBACKS_MODULE.description,
};

export default function PlaybacksPage() {
  return <LevelModulePage module={PLAYBACKS_MODULE} />;
}
