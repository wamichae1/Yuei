import type { Sampler } from "tone";

import type { MusicPitch } from "./types.ts";
import {
  getPianoSampleBaseUrl,
  isPianoMidiCovered,
  PIANO_SAMPLE_URLS,
} from "./pianoSamples.ts";

type ToneModule = typeof import("tone");

export interface MusicPlaybackPitch {
  toneName: string;
  midi: number;
}

export interface MusicPlaybackEvent {
  pitches: readonly MusicPlaybackPitch[];
  durationSeconds: number;
}

export interface MusicPlaybackOptions {
  startDelaySeconds?: number;
  gapBetweenEventsSeconds?: number;
  completionPaddingSeconds?: number;
}

let tonePromise: Promise<ToneModule> | null = null;
let sampler: Sampler | null = null;
let samplerPromise: Promise<Sampler> | null = null;
let playbackGeneration = 0;
const NOTE_DURATION_SECONDS = 0.65;
const PLAYBACK_START_SECONDS = 0.03;
const PIANO_RELEASE_SECONDS = 0.35;
const NOTE_COMPLETION_PADDING_SECONDS = 0.2;

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

function validatePlaybackEvents(events: readonly MusicPlaybackEvent[]) {
  for (const event of events) {
    for (const pitch of event.pitches) {
      if (!isPianoMidiCovered(pitch.midi)) {
        throw new Error(
          `Piano pitch ${pitch.toneName} (MIDI ${pitch.midi}) is not covered by the Salamander sample map.`,
        );
      }
    }
  }
}

export function getMusicPlaybackDurationMs(
  events: readonly MusicPlaybackEvent[],
  options: MusicPlaybackOptions = {},
): number {
  if (events.length === 0) return 0;

  const startDelaySeconds = options.startDelaySeconds ?? 0;
  const gapBetweenEventsSeconds =
    options.gapBetweenEventsSeconds ?? 0;
  const completionPaddingSeconds =
    options.completionPaddingSeconds ?? 0;
  const eventDurationSeconds = events.reduce(
    (total, event) => total + event.durationSeconds,
    0,
  );
  const interEventDurationSeconds =
    gapBetweenEventsSeconds * Math.max(0, events.length - 1);

  return Math.ceil(
    (startDelaySeconds +
      eventDurationSeconds +
      interEventDurationSeconds +
      completionPaddingSeconds) *
      1000,
  );
}

export async function playMusicEvents(
  events: readonly MusicPlaybackEvent[],
  options: MusicPlaybackOptions = {},
): Promise<number> {
  validatePlaybackEvents(events);

  const generation = ++playbackGeneration;
  const Tone = await getTone();
  await Tone.start();
  const activeSampler = await loadSampler();
  if (generation !== playbackGeneration || events.length === 0) {
    return 0;
  }

  const now = Tone.now();
  const startDelaySeconds = options.startDelaySeconds ?? 0;
  const gapBetweenEventsSeconds =
    options.gapBetweenEventsSeconds ?? 0;

  activeSampler.releaseAll(now);
  let eventStart = now + startDelaySeconds;

  for (const event of events) {
    const notes = event.pitches.map((pitch) => pitch.toneName);
    activeSampler.triggerAttackRelease(
      notes.length === 1 ? notes[0] : notes,
      event.durationSeconds,
      eventStart,
    );
    eventStart += event.durationSeconds + gapBetweenEventsSeconds;
  }

  return getMusicPlaybackDurationMs(events, options);
}

export async function playMusicPitch(pitch: MusicPitch): Promise<number> {
  return playMusicEvents(
    [
      {
        pitches: [pitch],
        durationSeconds: NOTE_DURATION_SECONDS,
      },
    ],
    {
      startDelaySeconds: PLAYBACK_START_SECONDS,
      completionPaddingSeconds: NOTE_COMPLETION_PADDING_SECONDS,
    },
  );
}

export async function stopMusicPlayback() {
  playbackGeneration += 1;
  sampler?.releaseAll();
}
