import type { Metadata } from "next";

import { LevelModulePage } from "@/features/level-training/LevelModulePage";
import { CLAPBACKS_MODULE } from "@/features/level-training/modules";

export const metadata: Metadata = {
  title: "Yuei · Clapbacks",
  description: CLAPBACKS_MODULE.description,
};

export default function ClapbacksPage() {
  return <LevelModulePage module={CLAPBACKS_MODULE} />;
}
