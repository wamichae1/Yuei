import type { PolySynth, Synth } from "tone";

import { getIntervalPlaybackEvents } from "./playback";
import type { IntervalExercise } from "./types";

let synth: PolySynth<Synth> | null = null;
const PLAYBACK_START_SECONDS = 0.03;
const EVENT_GAP_SECONDS = 0.17;

async function getSynth() {
  const Tone = await import("tone");
  await Tone.start();

  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.16,
        sustain: 0.28,
        release: 0.55,
      },
    }).toDestination();
    synth.volume.value = -8;
  }

  return { Tone, synth };
}

export async function unlockAudio() {
  await getSynth();
}

export async function playExercise(
  exercise: IntervalExercise,
): Promise<number> {
  const { Tone, synth: activeSynth } = await getSynth();
  const now = Tone.now();

  activeSynth.releaseAll(now);

  const events = getIntervalPlaybackEvents(exercise);
  let eventStart = now + PLAYBACK_START_SECONDS;
  let playbackEnd = eventStart;

  events.forEach((event, index) => {
    const duration = event.kind === "harmonic" ? 0.85 : index === 0 ? 0.42 : 0.5;
    const notes = event.notes.map((note) => note.toneName);

    activeSynth.triggerAttackRelease(
      event.kind === "harmonic" ? notes : notes[0],
      duration,
      eventStart,
    );

    playbackEnd = eventStart + duration;
    eventStart = playbackEnd + EVENT_GAP_SECONDS;
  });

  return Math.ceil((playbackEnd - now + EVENT_GAP_SECONDS) * 1000);
}

export async function stopPlayback() {
  if (!synth) return;
  const Tone = await import("tone");
  synth.releaseAll(Tone.now());
}
