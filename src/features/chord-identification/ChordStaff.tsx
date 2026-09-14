"use client";

import { useEffect, useRef } from "react";

import {
  formatChordPlayback,
  getChordPlaybackLabel,
  getChordPlaybackPlan,
  getChordRevealLabel,
} from "./playback";
import type { ChordIdentificationExercise } from "./types";

interface ChordStaffProps {
  exercise: ChordIdentificationExercise;
}

export function ChordStaff({ exercise }: ChordStaffProps) {
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
      const height = width < 420 ? 190 : 230;
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(width, height);

      const context = renderer.getContext();
      const stave = new Stave(10, height / 2 - 54, width - 20);
      stave.addClef("treble");
      stave.setStyle({
        fillStyle: "#0a0a0a",
        strokeStyle: "#0a0a0a",
      });
      stave.setContext(context).draw();

      const playbackEvents = getChordPlaybackPlan(exercise).events;
      const notes = playbackEvents.map(
        (event) =>
          new StaveNote({
            clef: "treble",
            keys: event.pitches.map((pitch) => pitch.vexKey),
            duration: "q",
          }),
      );

      playbackEvents.forEach((event, eventIndex) => {
        event.pitches.forEach((pitch, pitchIndex) => {
          if (pitch.accidental) {
            notes[eventIndex].addModifier(
              new Accidental(pitch.accidental),
              pitchIndex,
            );
          }
        });
      });

      notes.forEach((note, index) => {
        const isTarget =
          exercise.exerciseType === "tone" &&
          index === notes.length - 1;
        note.setStyle({
          fillStyle: isTarget ? "#ff5a1f" : "#0a0a0a",
          strokeStyle: isTarget ? "#ff5a1f" : "#0a0a0a",
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
            playbackEvents.length === 1 ? 90 : playbackEvents.length * 64,
            width - 190,
          ),
        );
      voice.draw(context, stave);

      const svg = container.querySelector("svg");
      svg?.setAttribute(
        "aria-label",
        `${getChordRevealLabel(exercise)}, ${getChordPlaybackLabel(
          exercise,
        )}: ${formatChordPlayback(exercise)}`,
      );
      svg?.setAttribute("role", "img");
      svg?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    void renderNotation();

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => void renderNotation());
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [exercise]);

  return (
    <div
      ref={containerRef}
      className="staff-notation mx-auto min-h-[190px] w-full max-w-[760px] overflow-hidden"
    />
  );
}

