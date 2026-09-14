export function nextTempoStep(
  activeTempo: number,
  targetTempo: number,
  increment = 4,
): number {
  if (activeTempo >= targetTempo) return targetTempo;
  return Math.min(targetTempo, activeTempo + Math.max(1, increment));
}

export function tempoProgress(current: number | undefined, target: number) {
  if (!current || target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function isAtTarget(
  current: number | undefined,
  target: number,
): boolean {
  return current !== undefined && current >= target;
}
