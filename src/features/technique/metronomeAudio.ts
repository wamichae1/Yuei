let timer: ReturnType<typeof setInterval> | null = null;
let context: AudioContext | null = null;

function click(volume: number) {
  context ??= new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 1100;
  gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)) * 0.25, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.04);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.05);
}

export async function startMetronome(bpm: number, volume: number) {
  stopMetronome();
  context ??= new AudioContext();
  await context.resume();
  click(volume);
  timer = setInterval(() => click(volume), 60_000 / bpm);
}

export function stopMetronome() {
  if (timer) clearInterval(timer);
  timer = null;
}
