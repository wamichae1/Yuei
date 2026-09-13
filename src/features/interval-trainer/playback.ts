import {
  INTERVAL_PLAYBACK_PATTERN_CONFIG,
  PRESENTATION_LABELS,
} from "./theory.ts";
import type { IntervalExercise, MusicalNote } from "./types.ts";
import type {
  MusicPlaybackEvent,
  MusicPlaybackOptions,
} from "../music/audio.ts";

export interface IntervalPlaybackEvent {
  kind: "melodic" | "harmonic";
  notes: readonly MusicalNote[];
}

export interface IntervalPlaybackPlan {
  events: readonly MusicPlaybackEvent[];
  options: MusicPlaybackOptions;
}

const PLAYBACK_START_SECONDS = 0.03;
const EVENT_GAP_SECONDS = 0.17;

function melodicEvent(note: MusicalNote): IntervalPlaybackEvent {
  return { kind: "melodic", notes: [note] };
}

function harmonicEvent(
  exercise: IntervalExercise,
): IntervalPlaybackEvent {
  return {
    kind: "harmonic",
    notes: [exercise.lowerNote, exercise.upperNote],
  };
}

export function getIntervalPlaybackEvents(
  exercise: IntervalExercise,
): readonly IntervalPlaybackEvent[] {
  switch (exercise.playbackPattern) {
    case "ascending-then-descending":
      return [
        melodicEvent(exercise.lowerNote),
        melodicEvent(exercise.upperNote),
        melodicEvent(exercise.lowerNote),
      ];
    case "directional-then-harmonic":
      return [
        ...exercise.notes.map(melodicEvent),
        harmonicEvent(exercise),
      ];
    case "directional-only":
      return exercise.notes.map(melodicEvent);
    case "selected-presentation":
      return exercise.presentation === "harmonic"
        ? [harmonicEvent(exercise)]
        : exercise.notes.map(melodicEvent);
  }
}

export function getIntervalPlaybackPlan(
  exercise: IntervalExercise,
): IntervalPlaybackPlan {
  return {
    events: getIntervalPlaybackEvents(exercise).map((event, index) => ({
      pitches: event.notes,
      durationSeconds:
        event.kind === "harmonic" ? 0.85 : index === 0 ? 0.42 : 0.5,
    })),
    options: {
      startDelaySeconds: PLAYBACK_START_SECONDS,
      gapBetweenEventsSeconds: EVENT_GAP_SECONDS,
      completionPaddingSeconds: EVENT_GAP_SECONDS,
    },
  };
}

export function formatIntervalPlayback(
  exercise: IntervalExercise,
): string {
  return getIntervalPlaybackEvents(exercise)
    .map((event) =>
      event.notes.map((note) => note.toneName).join("+"),
    )
    .join(" → ");
}

export function getIntervalPlaybackLabel(
  exercise: IntervalExercise,
): string {
  return exercise.playbackPattern === "selected-presentation"
    ? PRESENTATION_LABELS[exercise.presentation]
    : INTERVAL_PLAYBACK_PATTERN_CONFIG[exercise.playbackPattern].label;
}
