import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  AudioLines,
  Layers3,
} from "lucide-react";

import { LiquidCard } from "@/components/kokonutui/liquid-card";

export const metadata: Metadata = {
  title: "Yuei · Chord Identification",
  description:
    "An upcoming ear-training module for recognizing chords and harmonic qualities.",
};

const CHORD_QUALITIES = [
  "Major",
  "Minor",
  "Diminished",
  "Augmented",
] as const;

export default function ChordIdentificationPage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(10,10,10,0.055)_1px,transparent_1px)] [background-size:calc((100vw-2rem)/12)_100%]"
      />

      <header className="relative z-10 border-b-2 border-black bg-[var(--paper)]">
        <nav className="mx-auto grid h-20 w-full max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <Link
            href="/"
            aria-label="Return to Yuei.AI training home"
            className="group inline-flex w-fit items-center gap-3 rounded-[6px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--yellow)] lg:col-span-4"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[6px] border-2 border-black bg-[var(--orange)] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:translate-y-0">
              <Layers3 size={19} strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-[-0.055em]">
              Yuei<span className="text-[var(--green)]">.</span>
            </span>
          </Link>

          <div className="flex items-center justify-end gap-3 lg:col-span-8 lg:grid lg:grid-cols-8">
            <span className="technical-label hidden text-[var(--slate)] sm:inline lg:col-span-5 lg:border-l lg:border-[var(--gridline)] lg:pl-5">
              Ear-training system / Chords 03
            </span>
            <span className="technical-label rounded-[5px] border border-black bg-black px-3 py-2 text-white lg:col-span-3 lg:justify-self-end">
              Coming soon
            </span>
          </div>
        </nav>
      </header>

      <main className="relative z-[1] mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 items-center gap-10 px-4 py-9 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:py-12">
        <section className="lg:col-span-5 lg:self-start lg:pt-10">
          <div className="technical-label mb-7 flex items-center gap-3">
            <span className="h-2.5 w-2.5 border border-black bg-[var(--orange)]" />
            Module 03 / Chord identification
          </div>
          <h1 className="max-w-[650px] text-balance text-[clamp(4rem,8.5vw,8.3rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
            Hear
            <span className="block">the harmony.</span>
            <span className="block text-[var(--green)] [-webkit-text-stroke:1.5px_var(--ink)]">
              Name it.
            </span>
          </h1>
          <p className="mt-9 max-w-md text-pretty text-base leading-7 text-[var(--slate)] sm:text-lg sm:leading-8">
            Train your ear to recognize chords and harmonic qualities.
            This focused listening module is currently in development.
          </p>
          <Link
            href="/"
            className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-[6px] border-2 border-black bg-white px-4 font-semibold transition-colors hover:bg-[var(--yellow)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)]"
          >
            <ArrowLeft size={18} strokeWidth={2.25} />
            Back to training
          </Link>
        </section>

        <LiquidCard className="lg:col-span-7 lg:ml-5">
          <div className="flex items-start justify-between gap-4 border-b-2 border-black p-5 sm:p-6">
            <div>
              <p className="technical-label text-[var(--slate)]">
                Module preview
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Chord qualities
              </h2>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[6px] border-2 border-black bg-[var(--orange)]">
              <AudioLines size={21} strokeWidth={2.25} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-2 border-l-2 border-t-2 border-black">
              {CHORD_QUALITIES.map((quality, index) => (
                <div
                  key={quality}
                  className="flex min-h-24 flex-col justify-between border-b-2 border-r-2 border-black bg-white p-4 sm:min-h-28 sm:p-5"
                >
                  <span className="technical-label text-[var(--slate)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                    {quality}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-2 border-black bg-[var(--orange-soft)] p-5">
              <p className="technical-label text-[var(--slate)]">
                Development status
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-3 w-3 border border-black bg-[var(--orange)]" />
                <p className="font-semibold">
                  Listening exercises are coming soon.
                </p>
              </div>
            </div>
          </div>
        </LiquidCard>
      </main>

      <footer className="technical-label relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between border-t border-[var(--gridline)] px-4 py-4 text-[var(--slate)] sm:px-6 lg:px-8">
        <span>Listen / Compare / Identify</span>
        <span className="hidden sm:inline">
          Module boundary established
        </span>
      </footer>
    </div>
  );
}
