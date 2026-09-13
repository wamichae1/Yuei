import assert from "node:assert/strict";
import test from "node:test";

import {
  CLAPBACKS_MODULE,
  getTrainingLevel,
  LEVEL_NUMBERS,
  PLAYBACKS_MODULE,
} from "./modules.ts";

test("level-based modules expose the ordered levels 1 through 10", () => {
  for (const trainingModule of [
    CLAPBACKS_MODULE,
    PLAYBACKS_MODULE,
  ]) {
    assert.deepEqual(
      trainingModule.levels.map((level) => level.level),
      LEVEL_NUMBERS,
    );
    assert.equal(trainingModule.levels.length, 10);
  }
});

test("level lookup accepts only configured route values", () => {
  assert.equal(
    getTrainingLevel(CLAPBACKS_MODULE, "1")?.level,
    1,
  );
  assert.equal(
    getTrainingLevel(PLAYBACKS_MODULE, "10")?.level,
    10,
  );
  assert.equal(getTrainingLevel(CLAPBACKS_MODULE, "0"), undefined);
  assert.equal(getTrainingLevel(PLAYBACKS_MODULE, "11"), undefined);
  assert.equal(getTrainingLevel(PLAYBACKS_MODULE, "01"), undefined);
});
