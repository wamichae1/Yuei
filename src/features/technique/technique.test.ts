import assert from "node:assert/strict";
import test from "node:test";

import {
  formatMusicalKey,
  formatTargetTempo,
  isStableTechniqueId,
  musicalKeyToIdToken,
  RCM_TECHNIQUE_DATASET_VERSION,
  RCM_TECHNIQUE_DEFINITIONS,
  resolveTechniqueIds,
  validateTechniqueDefinitions,
} from "./data.ts";
import {
  generateBySetCount,
  generateCustomSets,
  replaceTechnique,
} from "./generator.ts";
import {
  DEFAULT_TECHNIQUE_STORE,
  deletePracticeSet,
  loadTechniqueStore,
  savePracticeSet,
  saveTechniqueStore,
  upsertTechniqueProgress,
  type StorageLike,
} from "./storage.ts";
import { isAtTarget, nextTempoStep } from "./tempo.ts";
import type {
  SavedPracticeSet,
  TechniqueDefinition,
  TechniqueSource,
} from "./types.ts";

const TEST_SOURCE: TechniqueSource = {
  syllabus: "NON-OFFICIAL SCHEMA TEST FIXTURE",
  edition: "TEST-ONLY",
  section: "Never exposed to production",
};

/**
 * Non-official records used only to prove schema expressiveness.
 * These are not RCM syllabus claims and are never imported by production data.
 */
const fixture: TechniqueDefinition[] = [
  {
    id: "L05_SCALE_D_MAJOR",
    level: 5,
    category: "scale",
    practiceGroup: "scales",
    displayName: "Fixture major scale",
    key: "D",
    tonality: "major",
    hands: "HT",
    octaves: 2,
    direction: "parallel",
    articulation: "legato",
    pattern: "scale",
    tempo: {
      bpm: 92,
      beatUnit: "quarter",
      performedNoteValue: "sixteenth",
      notesPerBeat: 4,
    },
    source: TEST_SOURCE,
  },
  {
    id: "L05_SCALE_E_HARMONIC_MINOR",
    level: 5,
    category: "scale",
    practiceGroup: "scales",
    displayName: "Fixture harmonic minor scale",
    key: "E",
    tonality: "minor",
    minorForm: "harmonic",
    hands: "HT",
    pattern: "scale",
    tempo: { bpm: 80, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_SCALE_E_MELODIC_MINOR",
    level: 5,
    category: "scale",
    practiceGroup: "scales",
    displayName: "Fixture melodic minor scale",
    key: "E",
    tonality: "minor",
    minorForm: "melodic",
    hands: "HT",
    pattern: "scale",
    tempo: { bpm: 80, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_SCALE_C_MAJOR_CONTRARY",
    level: 5,
    category: "scale",
    practiceGroup: "scales",
    displayName: "Fixture contrary-motion scale",
    key: "C",
    tonality: "major",
    hands: "HT",
    direction: "contrary",
    pattern: "scale",
    tempo: { bpm: 76, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_FORMULA_F_SHARP_MAJOR",
    level: 5,
    category: "formula_pattern",
    practiceGroup: "formula",
    displayName: "Fixture formula pattern",
    key: "F#",
    tonality: "major",
    hands: "HT",
    pattern: "formula",
    tempo: { bpm: 72, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_TRIAD_A_MINOR_TONIC_BROKEN",
    level: 5,
    category: "tonic_triad",
    practiceGroup: "chords",
    displayName: "Fixture broken tonic triad",
    key: "A",
    tonality: "minor",
    hands: "HT",
    pattern: "broken_chord",
    inversionRequirement: { positions: ["root"], mode: "single" },
    tempo: { bpm: 68, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_CHORD_G_MAJOR_TONIC",
    level: 5,
    category: "tonic_four_note_chord",
    practiceGroup: "chords",
    displayName: "Fixture tonic four-note chord",
    key: "G",
    tonality: "major",
    hands: "HT",
    pattern: "solid_chord",
    inversionRequirement: {
      positions: ["root", "first", "second", "third"],
      mode: "all_in_sequence",
    },
    tempo: { bpm: 64, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_DOM7_C_MAJOR",
    level: 5,
    category: "dominant_seventh",
    practiceGroup: "chords",
    displayName: "Fixture dominant seventh",
    key: "C",
    tonality: "major",
    hands: "HT",
    pattern: "solid_chord",
    inversionRequirement: { positions: ["root"], mode: "single" },
    tempo: { bpm: 60, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_DIM7_B_LEADING_TONE",
    level: 5,
    category: "leading_tone_diminished_seventh",
    practiceGroup: "chords",
    displayName: "Fixture leading-tone diminished seventh",
    key: "B",
    hands: "HT",
    pattern: "alternate_note",
    inversionRequirement: { positions: ["root"], mode: "any" },
    tempo: { bpm: 60, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_ARPEGGIO_G_MAJOR_TONIC",
    level: 5,
    category: "arpeggio",
    practiceGroup: "arpeggios",
    displayName: "Fixture arpeggio",
    key: "G",
    tonality: "major",
    hands: "HT",
    octaves: 2,
    pattern: "arpeggio",
    tempo: { bpm: 76, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_OCTAVE_SCALE_C_MAJOR",
    level: 5,
    category: "octave_scale",
    practiceGroup: "octaves",
    displayName: "Fixture octave scale",
    key: "C",
    tonality: "major",
    hands: "HS",
    octaves: 2,
    pattern: "solid_octaves",
    articulation: "staccato",
    tempo: { bpm: 72, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_TRIAD_C_MAJOR_PROGRESSION",
    level: 5,
    category: "tonic_triad",
    practiceGroup: "chords",
    displayName: "Fixture progression exercise",
    key: "C",
    tonality: "major",
    hands: "HT",
    pattern: "solid_chord",
    endingProgression: { degrees: ["I", "IV", "V", "I"] },
    tempo: { bpm: 66, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
  {
    id: "L05_OCTAVE_SCALE_D_MAJOR_ALTERNATIVE",
    level: 5,
    category: "octave_scale",
    practiceGroup: "octaves",
    displayName: "Fixture alternative exercise",
    key: "D",
    tonality: "major",
    hands: "HT",
    pattern: "solid_octaves",
    tempo: { bpm: 70, beatUnit: "quarter" },
    alternatives: [
      {
        id: "smaller-span",
        label: "Fixture alternative",
        description: "Non-official override used to validate the schema.",
        overrides: {
          hands: "HS",
          pattern: "broken_octaves",
          octaves: 1,
        },
      },
    ],
    source: TEST_SOURCE,
  },
  {
    id: "L06_SCALE_C_MAJOR",
    level: 6,
    category: "scale",
    practiceGroup: "scales",
    displayName: "Fixture Level 6 scale",
    key: "C",
    tonality: "major",
    hands: "HT",
    pattern: "scale",
    tempo: { bpm: 100, beatUnit: "quarter" },
    source: TEST_SOURCE,
  },
];

class MemoryStorage implements StorageLike {
  value: string | null = null;
  getItem() {
    return this.value;
  }
  setItem(_key: string, value: string) {
    this.value = value;
  }
}

test("production canonical data stays empty and fixtures never leak", () => {
  assert.equal(RCM_TECHNIQUE_DEFINITIONS.length, 0);
  assert.ok(!JSON.stringify(RCM_TECHNIQUE_DEFINITIONS).includes("Fixture"));
  assert.match(RCM_TECHNIQUE_DATASET_VERSION, /schema-draft/);
});

test("representative fixtures validate the refined canonical schema", () => {
  assert.deepEqual(validateTechniqueDefinitions(fixture), []);
  assert.equal(fixture[1].minorForm, "harmonic");
  assert.equal(fixture[2].minorForm, "melodic");
  assert.deepEqual(fixture[6].inversionRequirement?.positions, [
    "root",
    "first",
    "second",
    "third",
  ]);
  assert.deepEqual(fixture[11].endingProgression?.degrees, [
    "I",
    "IV",
    "V",
    "I",
  ]);
  assert.equal(fixture[12].alternatives?.[0].overrides?.hands, "HS");
  assert.equal(fixture[0].source.edition, "TEST-ONLY");
});

test("stable IDs and normalized key formatting are deterministic", () => {
  assert.equal(isStableTechniqueId("L04_SCALE_B_FLAT_MAJOR"), true);
  assert.equal(isStableTechniqueId("Level 4 B♭ major"), false);
  assert.equal(formatMusicalKey("F#"), "F♯");
  assert.equal(formatMusicalKey("Bb"), "B♭");
  assert.equal(musicalKeyToIdToken("F#"), "F_SHARP");
  assert.equal(musicalKeyToIdToken("Bb"), "B_FLAT");
});

test("tempo retains beat unit, performed value, and notes per beat", () => {
  assert.deepEqual(fixture[0].tempo, {
    bpm: 92,
    beatUnit: "quarter",
    performedNoteValue: "sixteenth",
    notesPerBeat: 4,
  });
  assert.match(formatTargetTempo(fixture[0]), /92/);
  assert.match(formatTargetTempo(fixture[0]), /sixteenth notes/);
});

test("validation catches IDs, categories, groups, sources, and tempo", () => {
  const invalid = {
    ...fixture[0],
    id: "bad id",
    category: "fake_category",
    practiceGroup: "fake_group",
    tempo: { bpm: 0, beatUnit: "quarter" },
    source: { syllabus: "", edition: "" },
  } as unknown as TechniqueDefinition;
  const errors = validateTechniqueDefinitions([invalid]);
  assert.ok(errors.some((error) => error.includes("stable ID")));
  assert.ok(errors.some((error) => error.includes("invalid category")));
  assert.ok(errors.some((error) => error.includes("invalid practice group")));
  assert.ok(errors.some((error) => error.includes("invalid target tempo")));
  assert.ok(errors.some((error) => error.includes("source metadata")));
});

test("balanced generation uses the selected level without duplicates", () => {
  const sets = generateBySetCount({
    definitions: fixture,
    level: 5,
    setCount: 3,
    random: () => 0.4,
  });
  const ids = sets.flat();
  assert.equal(ids.length, 13);
  assert.equal(new Set(ids).size, 13);
  assert.ok(ids.every((id) => id.startsWith("L05_")));
  assert.ok(
    Math.max(...sets.map((set) => set.length)) -
      Math.min(...sets.map((set) => set.length)) <=
      1,
  );
});

test("custom generation counts broad practice groups", () => {
  const [set] = generateCustomSets({
    definitions: fixture,
    level: 5,
    setCount: 1,
    practiceGroupCounts: { scales: 3, chords: 2, arpeggios: 1 },
    random: () => 0.3,
  });
  const resolved = resolveTechniqueIds(set, fixture);
  assert.equal(
    resolved.filter((item) => item.practiceGroup === "scales").length,
    3,
  );
  assert.equal(
    resolved.filter((item) => item.practiceGroup === "chords").length,
    2,
  );
  assert.equal(
    resolved.filter((item) => item.practiceGroup === "arpeggios").length,
    1,
  );
});

test("replacement preserves precise category and level", () => {
  const current = ["L05_SCALE_D_MAJOR", "L05_ARPEGGIO_G_MAJOR_TONIC"];
  const replaced = replaceTechnique(
    current,
    "L05_SCALE_D_MAJOR",
    fixture,
    () => 0,
  );
  const replacement = resolveTechniqueIds([replaced[0]], fixture)[0];
  assert.notEqual(replaced[0], current[0]);
  assert.equal(replacement.level, 5);
  assert.equal(replacement.category, "scale");
});

test("saved sets resolve stable IDs and progress follows those IDs", () => {
  const storage = new MemoryStorage();
  const ids = ["L05_SCALE_D_MAJOR", "L05_ARPEGGIO_G_MAJOR_TONIC"];
  const updated = upsertTechniqueProgress(
    structuredClone(DEFAULT_TECHNIQUE_STORE),
    ids[0],
    { currentPracticeTempo: 84 },
  );
  saveTechniqueStore(storage, updated);
  const reloaded = loadTechniqueStore(storage);
  assert.equal(reloaded.progress[ids[0]].currentPracticeTempo, 84);
  assert.deepEqual(
    resolveTechniqueIds(ids, fixture).map((item) => item.id),
    ids,
  );
});

test("active metronome changes do not alter saved technique tempo", () => {
  const id = fixture[0].id;
  const data = upsertTechniqueProgress(
    structuredClone(DEFAULT_TECHNIQUE_STORE),
    id,
    { currentPracticeTempo: 84 },
  );
  const changedMetronome = {
    ...data,
    metronome: { ...data.metronome, bpm: 104 },
  };
  assert.equal(changedMetronome.progress[id].currentPracticeTempo, 84);
  const explicitlySaved = upsertTechniqueProgress(changedMetronome, id, {
    currentPracticeTempo: 104,
  });
  assert.equal(explicitlySaved.progress[id].currentPracticeTempo, 104);
});

test("progressive tempo moves toward target without exceeding it", () => {
  assert.equal(nextTempoStep(72, 104, 4), 76);
  assert.equal(nextTempoStep(102, 104, 4), 104);
  assert.equal(nextTempoStep(110, 104, 4), 104);
  assert.equal(isAtTarget(104, 104), true);
  assert.equal(isAtTarget(103, 104), false);
});

test("deleting a saved set does not delete technique progress", () => {
  const now = "2026-09-14T12:00:00.000Z";
  const set: SavedPracticeSet = {
    id: "set-1",
    name: "Fixture set",
    level: 5,
    techniqueDefinitionIds: [fixture[0].id, fixture[9].id],
    createdAt: now,
    updatedAt: now,
  };
  let data = upsertTechniqueProgress(
    structuredClone(DEFAULT_TECHNIQUE_STORE),
    fixture[0].id,
    { currentPracticeTempo: 84 },
  );
  data = savePracticeSet(data, set);
  assert.deepEqual(data.savedSets[0].techniqueDefinitionIds, set.techniqueDefinitionIds);
  data = deletePracticeSet(data, set.id);
  assert.equal(data.savedSets.length, 0);
  assert.equal(data.progress[fixture[0].id].currentPracticeTempo, 84);
});
