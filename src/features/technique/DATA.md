# RCM Technique Data

`data.ts` is the single source of truth for RCM piano-technique syllabus
definitions. The application intentionally contains no guessed syllabus
requirements.

The current dataset identifier is `schema-draft-2026-09`. It identifies the
schema draft and does not claim that an official RCM edition has been
populated.

Populate `RCM_TECHNIQUE_DEFINITIONS` only from the project's approved source.
Each playable requirement must be one record with a stable level-prefixed ID,
precise category, broad practice group, normalized key, structured
hands/range/pattern/articulation/inversions/progression, tempo, alternatives,
and source metadata.

User progress and saved sets reference stable definition IDs. Changing display
text does not break saved data; deleting or renaming an ID does.
