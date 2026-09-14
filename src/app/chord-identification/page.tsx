import type { Metadata } from "next";

import { ChordIdentification } from "@/features/chord-identification/ChordIdentification";

export const metadata: Metadata = {
  title: "Yuei · Chord Identification",
  description:
    "Practice RCM chord-quality and chord-tone identification for Levels 1 through 10.",
};

export default function ChordIdentificationPage() {
  return <ChordIdentification />;
}
