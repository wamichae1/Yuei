import type {
  BeatUnit,
  MusicalKey,
  TechniqueCategory,
  TechniqueDefinition,
  TechniquePattern,
  TechniquePracticeGroup,
} from "./types.ts";
import {
  MUSICAL_KEYS,
  TECHNIQUE_CATEGORIES,
  TECHNIQUE_PRACTICE_GROUPS,
} from "./types.ts";

export const RCM_TECHNIQUE_DATASET_VERSION = "schema-draft-2026-09";

/**
 * Canonical RCM technique definitions belong here.
 *
 * This array intentionally remains empty until an approved, authoritative
 * Levels 1–10 syllabus dataset is supplied. Test fixtures live only in the
 * test module and must never be imported here.
 */
export const RCM_TECHNIQUE_DEFINITIONS: readonly TechniqueDefinition[] = [];

export const RCM_TECHNIQUE_DATA_NOTICE =
  "No verified RCM piano-technique syllabus dataset is bundled with this repository. Requirements and generation are disabled until canonical definitions are supplied.";

export const CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  scale: "Scales",
  formula_pattern: "Formula Patterns",
  chromatic_scale: "Chromatic Scales",
  tonic_triad: "Tonic Triads",
  tonic_four_note_chord: "Tonic Four-note Chords",
  dominant_seventh: "Dominant 7ths",
  leading_tone_diminished_seventh: "Leading-tone Diminished 7ths",
  arpeggio: "Arpeggios",
  octave_scale: "Octave Scales",
};

export const PRACTICE_GROUP_LABELS: Record<
  TechniquePracticeGroup,
  string
> = {
  scales: "Scales",
  chords: "Chords",
  arpeggios: "Arpeggios",
  chromatic: "Chromatic",
  formula: "Formula",
  octaves: "Octaves",
};

export const CATEGORY_PRACTICE_GROUP: Record<
  TechniqueCategory,
  TechniquePracticeGroup
> = {
  scale: "scales",
  formula_pattern: "formula",
  chromatic_scale: "chromatic",
  tonic_triad: "chords",
  tonic_four_note_chord: "chords",
  dominant_seventh: "chords",
  leading_tone_diminished_seventh: "chords",
  arpeggio: "arpeggios",
  octave_scale: "octaves",
};

const BEAT_SYMBOLS: Record<BeatUnit, string> = {
  whole: "𝅝",
  dotted_half: "𝅗𝅥.",
  half: "𝅗𝅥",
  dotted_quarter: "♩.",
  quarter: "♩",
  dotted_eighth: "♪.",
  eighth: "♪",
  sixteenth: "𝅘𝅥𝅯",
};

const NOTE_VALUE_LABELS: Record<BeatUnit, string> = {
  whole: "whole notes",
  dotted_half: "dotted half notes",
  half: "half notes",
  dotted_quarter: "dotted quarter notes",
  quarter: "quarter notes",
  dotted_eighth: "dotted eighth notes",
  eighth: "eighth notes",
  sixteenth: "sixteenth notes",
};

const PATTERN_LABELS: Record<TechniquePattern, string> = {
  scale: "Scale pattern",
  formula: "Formula pattern",
  chromatic: "Chromatic pattern",
  broken_chord: "Broken chord",
  solid_chord: "Solid chord",
  alternate_note: "Alternate-note pattern",
  arpeggio: "Arpeggio pattern",
  solid_octaves: "Solid octaves",
  broken_octaves: "Broken octaves",
};

const INVERSION_LABELS = {
  root: "Root position",
  first: "1st inversion",
  second: "2nd inversion",
  third: "3rd inversion",
} as const;

const INVERSION_MODE_LABELS = {
  single: "single position",
  all: "all required positions",
  all_in_sequence: "all in sequence",
  any: "any requested position",
} as const;

const STABLE_ID_PATTERN = /^L(0[1-9]|10)_[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

export function isStableTechniqueId(id: string): boolean {
  return STABLE_ID_PATTERN.test(id);
}

export function formatMusicalKey(key: MusicalKey): string {
  return key.replace("#", "♯").replace("b", "♭");
}

export function musicalKeyToIdToken(key: MusicalKey): string {
  return key.replace("#", "_SHARP").replace("b", "_FLAT");
}

export function getTechniquesForLevel(level: number) {
  return RCM_TECHNIQUE_DEFINITIONS.filter(
    (definition) => definition.level === level,
  );
}

export function getTechniqueById(id: string) {
  return RCM_TECHNIQUE_DEFINITIONS.find(
    (definition) => definition.id === id,
  );
}

export function resolveTechniqueIds(
  ids: readonly string[],
  definitions: readonly TechniqueDefinition[] = RCM_TECHNIQUE_DEFINITIONS,
) {
  const byId = new Map(definitions.map((definition) => [definition.id, definition]));
  return ids
    .map((id) => byId.get(id))
    .filter((definition) => definition !== undefined);
}

export function formatTargetTempo(definition: TechniqueDefinition) {
  const performed = definition.tempo.performedNoteValue
    ? ` · performed as ${NOTE_VALUE_LABELS[definition.tempo.performedNoteValue]}`
    : "";
  const grouping = definition.tempo.notesPerBeat
    ? ` · ${definition.tempo.notesPerBeat} notes per beat`
    : "";
  return `${BEAT_SYMBOLS[definition.tempo.beatUnit]} = ${definition.tempo.bpm}${performed}${grouping}`;
}

export function getTechniqueFacts(definition: TechniqueDefinition): string[] {
  const inversions = definition.inversionRequirement;
  return [
    definition.key ? formatMusicalKey(definition.key) : undefined,
    definition.minorForm ? `${definition.minorForm} minor` : undefined,
    definition.hands === "HT" ? "Hands together" : "Hands separately",
    definition.octaves ? `${definition.octaves} octaves` : undefined,
    definition.direction === "parallel"
      ? "Parallel motion"
      : definition.direction === "contrary"
        ? "Contrary motion"
        : undefined,
    definition.articulation
      ? `${definition.articulation[0].toUpperCase()}${definition.articulation.slice(1)}`
      : undefined,
    definition.pattern ? PATTERN_LABELS[definition.pattern] : undefined,
    inversions
      ? `${inversions.positions.map((position) => INVERSION_LABELS[position]).join(" + ")} · ${INVERSION_MODE_LABELS[inversions.mode]}`
      : undefined,
    definition.endingProgression
      ? `Ends ${definition.endingProgression.degrees.join("–")}`
      : undefined,
  ].filter((value): value is string => Boolean(value));
}

export function validateTechniqueDefinitions(
  definitions: readonly TechniqueDefinition[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const categories = new Set<string>(TECHNIQUE_CATEGORIES);
  const groups = new Set<string>(TECHNIQUE_PRACTICE_GROUPS);
  const keys = new Set<string>(MUSICAL_KEYS);

  for (const definition of definitions) {
    if (!isStableTechniqueId(definition.id)) {
      errors.push(`${definition.id || "(empty)"}: invalid stable ID format`);
    }
    if (ids.has(definition.id)) errors.push(`Duplicate ID: ${definition.id}`);
    ids.add(definition.id);
    if (definition.level < 1 || definition.level > 10) {
      errors.push(`${definition.id}: invalid level ${definition.level}`);
    }
    const encodedLevel = Number(definition.id.slice(1, 3));
    if (isStableTechniqueId(definition.id) && encodedLevel !== definition.level) {
      errors.push(`${definition.id}: ID level does not match level field`);
    }
    if (!categories.has(definition.category)) {
      errors.push(`${definition.id}: invalid category`);
    }
    if (!groups.has(definition.practiceGroup)) {
      errors.push(`${definition.id}: invalid practice group`);
    }
    if (
      categories.has(definition.category) &&
      groups.has(definition.practiceGroup) &&
      CATEGORY_PRACTICE_GROUP[definition.category] !==
        definition.practiceGroup
    ) {
      errors.push(`${definition.id}: category/practice group mismatch`);
    }
    if (definition.key && !keys.has(definition.key)) {
      errors.push(`${definition.id}: invalid musical key`);
    }
    if (definition.minorForm && definition.tonality !== "minor") {
      errors.push(`${definition.id}: minor form requires minor tonality`);
    }
    if (
      !Number.isFinite(definition.tempo.bpm) ||
      definition.tempo.bpm <= 0
    ) {
      errors.push(`${definition.id}: invalid target tempo`);
    }
    if (!definition.tempo.beatUnit) {
      errors.push(`${definition.id}: missing beat unit`);
    }
    if (!definition.hands) errors.push(`${definition.id}: missing hands`);
    if (!definition.displayName.trim()) {
      errors.push(`${definition.id}: missing display name`);
    }
    if (
      !definition.source.syllabus.trim() ||
      !definition.source.edition.trim()
    ) {
      errors.push(`${definition.id}: incomplete source metadata`);
    }
    if (
      definition.inversionRequirement &&
      definition.inversionRequirement.positions.length === 0
    ) {
      errors.push(`${definition.id}: inversion positions cannot be empty`);
    }
    if (
      definition.endingProgression &&
      definition.endingProgression.degrees.length === 0
    ) {
      errors.push(`${definition.id}: progression degrees cannot be empty`);
    }
    const alternativeIds = new Set<string>();
    for (const alternative of definition.alternatives ?? []) {
      if (!alternative.id.trim() || alternativeIds.has(alternative.id)) {
        errors.push(`${definition.id}: invalid or duplicate alternative ID`);
      }
      alternativeIds.add(alternative.id);
      if (!alternative.label.trim() || !alternative.description.trim()) {
        errors.push(`${definition.id}: incomplete alternative`);
      }
    }
  }
  return errors;
}
