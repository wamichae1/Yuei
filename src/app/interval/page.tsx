import type { Metadata } from "next";

import { IntervalTrainer } from "@/features/interval-trainer/IntervalTrainer";

export const metadata: Metadata = {
  title: "Yuei · Interval Trainer",
  description: "Train your ear to recognize musical intervals.",
};

export default function IntervalTrainerPage() {
  return <IntervalTrainer />;
}
