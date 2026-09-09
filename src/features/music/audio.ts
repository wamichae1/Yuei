import type { Synth } from "tone";

import type { MusicPitch } from "./types";

let synth: Synth | null = null;
const NOTE_DURATION_SECONDS = 0.65;
const PLAYBACK_START_SECONDS = 0.03;

async function getSynth() {
  const Tone = await import("tone");
  await Tone.start();

  if (!synth) {
    synth = new Tone.Synth({
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

export async function unlockMusicAudio() {
  await getSynth();
}

export async function playMusicPitch(pitch: MusicPitch): Promise<number> {
  const { Tone, synth: activeSynth } = await getSynth();
  const now = Tone.now();

  activeSynth.triggerRelease(now);
  activeSynth.triggerAttackRelease(
    pitch.toneName,
    NOTE_DURATION_SECONDS,
    now + PLAYBACK_START_SECONDS,
  );

  return Math.ceil(
    (PLAYBACK_START_SECONDS + NOTE_DURATION_SECONDS + 0.2) * 1000,
  );
}

export async function stopMusicPlayback() {
  if (!synth) return;
  const Tone = await import("tone");
  synth.triggerRelease(Tone.now());
}
