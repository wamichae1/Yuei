"use client";

import { useEffect, useRef } from "react";

import type { NoteIdentificationExercise } from "./types";

interface NoteStaffProps {
  exercise: NoteIdentificationExercise;
}

export function NoteStaff({ exercise }: NoteStaffProps) {
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
      stave.addClef(exercise.clef);
      stave.setStyle({
        fillStyle: "#0a0a0a",
        strokeStyle: "#0a0a0a",
      });
      stave.setContext(context).draw();

      const note = new StaveNote({
        clef: exercise.clef,
        keys: [exercise.pitch.vexKey],
        duration: "q",
      });
      if (exercise.pitch.accidental) {
        note.addModifier(new Accidental(exercise.pitch.accidental), 0);
      }
      note.setStyle({
        fillStyle: "#0a0a0a",
        strokeStyle: "#0a0a0a",
      });

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickable(note);
      new Formatter()
        .joinVoices([voice])
        .format([voice], Math.max(100, width - 190));
      voice.draw(context, stave);

      const svg = container.querySelector("svg");
      svg?.setAttribute(
        "aria-label",
        `Single note identification prompt on ${exercise.clef} clef`,
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
