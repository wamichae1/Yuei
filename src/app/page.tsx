import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  Layers3,
  Piano,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";

export const metadata: Metadata = {
  title: "Yuei · Music Training",
  description:
    "Choose a focused Yuei.AI training module for intervals, note reading, or chords.",
};

const MODULES = [
  {
    number: "01",
    title: "Interval Training",
    description: "Train your ear to recognize musical intervals.",
    href: "/interval",
    status: "Ready",
    action: "Start training",
    icon: AudioLines,
    accent: "bg-[var(--green)]",
  },
  {
    number: "02",
    title: "Note Identification",
    description:
      "Practice reading notes quickly across treble and bass clefs.",
    href: "/note-identification",
    status: "Ready",
    action: "Start reading",
    icon: Piano,
    accent: "bg-[var(--yellow)]",
  },
  {
    number: "03",
    title: "Chord Identification",
    description:
      "Train your ear to recognize chords and harmonic qualities.",
    href: "/chord-identification",
    status: "Coming soon",
    action: "Preview module",
    icon: Layers3,
    accent: "bg-[var(--orange)]",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div
        aria-hidden="true"
        className="editorial-grid pointer-events-none absolute inset-0 opacity-55"
      />

      <header className="relative z-10 border-b-2 border-black bg-[var(--paper)]">
        <div className="mx-auto grid h-20 w-full max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="inline-flex w-fit items-center gap-3 lg:col-span-4">
            <span className="grid h-10 w-10 place-items-center rounded-[6px] border-2 border-black bg-[var(--green)]">
              <AudioLines size={19} strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-[-0.055em]">
              Yuei<span className="text-[var(--green)]">.</span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 lg:col-span-8 lg:grid lg:grid-cols-8">
            <span className="technical-label hidden text-[var(--slate)] sm:inline lg:col-span-5 lg:border-l lg:border-[var(--gridline)] lg:pl-5">
              Music-learning system / Practice hub
            </span>
            <span className="technical-label rounded-[5px] border border-black bg-black px-3 py-2 text-white lg:col-span-3 lg:justify-self-end">
              Local practice
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-[1] mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <section className="grid items-end gap-8 border-b-2 border-black pb-10 lg:grid-cols-12 lg:gap-6 lg:pb-14">
          <div className="lg:col-span-8">
            <div className="technical-label mb-7 flex items-center gap-3">
              <span className="h-2.5 w-2.5 border border-black bg-[var(--green)]" />
              Training index / Three modules
            </div>
            <h1 className="max-w-4xl text-balance text-[clamp(3.7rem,8vw,7.7rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
              Practice music.
              <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">
                Build instinct.
              </span>
            </h1>
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-[var(--gridline)] lg:pl-6">
            <p className="max-w-md text-pretty text-base leading-7 text-[var(--slate)] sm:text-lg sm:leading-8">
              Choose what you want to practice. Each focused session
              connects sound, notation, and musical recognition.
            </p>
            <p className="technical-label mt-7 text-[var(--slate)]">
              Select a module to begin
            </p>
          </div>
        </section>

        <section
          aria-label="Training modules"
          className="grid flex-1 gap-5 py-8 md:grid-cols-3 lg:gap-6 lg:py-10"
        >
          {MODULES.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group block rounded-[10px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--yellow)]"
              >
                <LiquidCard className="flex h-full min-h-[310px] flex-col transition-colors duration-200 group-hover:bg-[var(--paper)]">
                  <div className="flex items-start justify-between gap-4 border-b-2 border-black p-5">
                    <div>
                      <p className="technical-label text-[var(--slate)]">
                        Module {module.number}
                      </p>
                      <span className="technical-label mt-2 inline-block border border-black bg-white px-2 py-1 text-[var(--ink)]">
                        {module.status}
                      </span>
                    </div>
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border-2 border-black ${module.accent}`}
                    >
                      <Icon size={21} strokeWidth={2.25} />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h2 className="text-3xl font-semibold leading-none tracking-[-0.05em] sm:text-[2.15rem]">
                      {module.title}
                    </h2>
                    <p className="mt-5 text-base leading-7 text-[var(--slate)]">
                      {module.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-black pt-5">
                      <span className="technical-label font-semibold text-[var(--ink)]">
                        {module.action}
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        size={20}
                        strokeWidth={2.25}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>
                </LiquidCard>
              </Link>
            );
          })}
        </section>
      </main>

      <footer className="technical-label relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between border-t border-[var(--gridline)] px-4 py-4 text-[var(--slate)] sm:px-6 lg:px-8">
        <span>Hear / Read / Understand</span>
        <span className="hidden sm:inline">Yuei.AI training system</span>
      </footer>
    </div>
  );
}
