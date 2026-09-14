import type { Metadata } from "next";

import { TechniquePracticeApp } from "@/features/technique/TechniquePracticeApp";

export const metadata: Metadata = {
  title: "Yuei · RCM Technique Practice",
  description:
    "Review RCM piano technique requirements, build practice sets, and develop persistent tempos for Levels 1 through 10.",
};

export default function TechniquePage() {
  return <TechniquePracticeApp />;
}
