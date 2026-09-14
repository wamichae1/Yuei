import type {
  MusicPlaybackEvent,
  MusicPlaybackOptions,
} from "@/features/music/audio";
import type { MusicPitch } from "@/features/music/types";

import {
  CHORD_DEFINITIONS,
  CHORD_TONE_LABELS,
  INVERSION_LABELS,
} from "./theory.ts";
import type { ChordIdentificationExercise } from "./types.ts";

export interface ChordPlaybackPlan {
  events: readonly ChordPlaybackEvent[];
  options: MusicPlaybackOptions;
}

export interface ChordPlaybackEvent extends MusicPlaybackEvent {
  pitches: readonly MusicPitch[];
}

const START_DELAY_SECONDS = 0.03;
const EVENT_GAP_SECONDS = 0.18;

export function getChordPlaybackPlan(
  exercise: ChordIdentificationExercise,
): ChordPlaybackPlan {
  const brokenEvents = exercise.chordNotes.map((pitch) => ({
    pitches: [pitch],
    durationSeconds: 0.42,
  }));

  switch (exercise.playbackPattern) {
    case "blocked":
      return {
        events: [
          {
            pitches: exercise.chordNotes,
            durationSeconds: 0.95,
          },
        ],
        options: {
          startDelaySeconds: START_DELAY_SECONDS,
          completionPaddingSeconds: EVENT_GAP_SECONDS,
        },
      };
    case "broken-then-blocked":
      return {
        events: [
          ...brokenEvents,
          {
            pitches: exercise.chordNotes,
            durationSeconds: 0.95,
          },
        ],
        options: {
          startDelaySeconds: START_DELAY_SECONDS,
          gapBetweenEventsSeconds: EVENT_GAP_SECONDS,
          completionPaddingSeconds: EVENT_GAP_SECONDS,
        },
      };
    case "broken-then-target":
      if (exercise.exerciseType !== "tone") {
        throw new Error(
          "Broken-then-target playback requires a chord-tone exercise.",
        );
      }
      return {
        events: [
          ...brokenEvents,
          {
            pitches: [exercise.targetNote],
            durationSeconds: 0.65,
          },
        ],
        options: {
          startDelaySeconds: START_DELAY_SECONDS,
          gapBetweenEventsSeconds: EVENT_GAP_SECONDS,
          completionPaddingSeconds: EVENT_GAP_SECONDS,
        },
      };
  }
}

export function formatChordPlayback(
  exercise: ChordIdentificationExercise,
): string {
  return getChordPlaybackPlan(exercise)
    .events.map((event) =>
      event.pitches.map((pitch) => pitch.toneName).join("+"),
    )
    .join(" → ");
}

export function getChordPlaybackLabel(
  exercise: ChordIdentificationExercise,
): string {
  switch (exercise.playbackPattern) {
    case "blocked":
      return "Blocked once";
    case "broken-then-blocked":
      return "Broken, then blocked";
    case "broken-then-target":
      if (exercise.exerciseType !== "tone") {
        throw new Error(
          "Broken-then-target playback requires a chord-tone exercise.",
        );
      }
      return `Broken, then ${CHORD_TONE_LABELS[exercise.targetTone]}`;
  }
}

export function getChordRevealLabel(
  exercise: ChordIdentificationExercise,
): string {
  const definition = CHORD_DEFINITIONS[exercise.chordType];
  const inversion = INVERSION_LABELS[exercise.inversion];
  return `${definition.label} / ${inversion}`;
}
