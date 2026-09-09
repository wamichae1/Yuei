"use client";

import { useEffect, useRef } from "react";

import {
  formatIntervalPlayback,
  getIntervalPlaybackEvents,
  getIntervalPlaybackLabel,
} from "./playback";
import type { Clef, IntervalExercise } from "./types";
import { INTERVAL_DEFINITIONS } from "./theory";

interface MusicStaffProps {
  clef: Clef;
  exercise: IntervalExercise;
}

export function MusicStaff({ clef, exercise }: MusicStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    async function renderNotation() {
      const container = containerRef.current;
      if (!container) return;

      const {
        Accidental,
        Formatter,
        Renderer,
        Stave,
        StaveNote,
        Voice,
      } = await import("vexflow");

      if (cancelled) return;

      container.replaceChildren();
      const width = Math.max(240, Math.min(container.clientWidth, 760));
      const height = width < 420 ? 180 : 220;
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(width, height);

      const context = renderer.getContext();
      const stave = new Stave(10, height / 2 - 54, width - 20);
      stave.addClef(clef);
      stave.setStyle({
        fillStyle: "#0a0a0a",
        strokeStyle: "#0a0a0a",
      });
      stave.setContext(context).draw();

      const playbackEvents = getIntervalPlaybackEvents(exercise);
      const notes = playbackEvents.map(
        (event) =>
          new StaveNote({
            clef,
            keys: event.notes.map((note) => note.vexKey),
            duration: "q",
          }),
      );

      playbackEvents.forEach((event, eventIndex) => {
        event.notes.forEach((note, noteIndex) => {
          if (note.accidental) {
            notes[eventIndex].addModifier(
              new Accidental(note.accidental),
              noteIndex,
            );
          }
        });
      });

      notes.forEach((staveNote) => {
        staveNote.setStyle({
          fillStyle: "#0a0a0a",
          strokeStyle: "#0a0a0a",
        });
      });

      const voice = new Voice({
        numBeats: playbackEvents.length,
        beatValue: 4,
      });
      voice.setStrict(false);
      voice.addTickables(notes);

      new Formatter()
        .joinVoices([voice])
        .format(
          [voice],
          Math.max(
            playbackEvents.length === 1 ? 80 : playbackEvents.length * 60,
            width - 190,
          ),
        );
      voice.draw(context, stave);

      const svg = container.querySelector("svg");
      svg?.setAttribute(
        "aria-label",
        `${INTERVAL_DEFINITIONS[exercise.intervalId].label}, ${getIntervalPlaybackLabel(
          exercise,
        )}: ${formatIntervalPlayback(exercise)}`,
      );
      svg?.setAttribute("role", "img");
      svg?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    void renderNotation();

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => void renderNotation());
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [clef, exercise]);

  return (
    <div
      ref={containerRef}
      className="staff-notation mx-auto min-h-[180px] w-full max-w-[760px] overflow-hidden"
    />
  );
}
