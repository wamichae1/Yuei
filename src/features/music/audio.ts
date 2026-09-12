import type { Sampler } from "tone";

import type { MusicPitch } from "./types";
import {
  getPianoSampleBaseUrl,
  PIANO_SAMPLE_URLS,
} from "./pianoSamples";

type ToneModule = typeof import("tone");

let tonePromise: Promise<ToneModule> | null = null;
let sampler: Sampler | null = null;
let samplerPromise: Promise<Sampler> | null = null;
const NOTE_DURATION_SECONDS = 0.65;
const PLAYBACK_START_SECONDS = 0.03;
const PIANO_RELEASE_SECONDS = 0.35;

function getTone() {
  tonePromise ??= import("tone");
  return tonePromise;
}

async function createSampler(): Promise<Sampler> {
  const Tone = await getTone();

  return new Promise<Sampler>((resolve, reject) => {
    let nextSampler: Sampler | null = null;
    let settled = false;

    const handleError = (error: Error) => {
      if (settled) return;
      settled = true;
      if (sampler === nextSampler) {
        sampler = null;
      }
      nextSampler?.dispose();
      reject(error);
    };

    nextSampler = new Tone.Sampler({
      urls: PIANO_SAMPLE_URLS,
      baseUrl: getPianoSampleBaseUrl(),
      attack: 0,
      release: PIANO_RELEASE_SECONDS,
      onload: () => {
        if (settled) return;
        settled = true;
        resolve(nextSampler!);
      },
      onerror: handleError,
    }).toDestination();
    nextSampler.volume.value = -8;
    sampler = nextSampler;
  });
}

function loadSampler(): Promise<Sampler> {
  if (sampler?.loaded) {
    return Promise.resolve(sampler);
  }

  if (!samplerPromise) {
    samplerPromise = createSampler().catch((error: unknown) => {
      samplerPromise = null;
      throw error;
    });
  }

  return samplerPromise;
}

export async function preloadMusicAudio() {
  await loadSampler();
}

export async function unlockMusicAudio() {
  const samplerLoad = loadSampler();
  const Tone = await getTone();
  await Tone.start();
  await samplerLoad;
}

export async function playMusicPitch(pitch: MusicPitch): Promise<number> {
  const Tone = await getTone();
  await Tone.start();
  const activeSampler = await loadSampler();
  const now = Tone.now();

  activeSampler.releaseAll(now);
  activeSampler.triggerAttackRelease(
    pitch.toneName,
    NOTE_DURATION_SECONDS,
    now + PLAYBACK_START_SECONDS,
  );

  return Math.ceil(
    (PLAYBACK_START_SECONDS + NOTE_DURATION_SECONDS + 0.2) * 1000,
  );
}

export async function stopMusicPlayback() {
  sampler?.releaseAll();
}
