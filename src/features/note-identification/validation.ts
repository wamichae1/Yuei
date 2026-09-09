import type {
  NoteIdentificationAnswer,
  NoteIdentificationExercise,
} from "./types";

export function isNoteIdentificationAnswerCorrect(
  exercise: NoteIdentificationExercise,
  answer: NoteIdentificationAnswer,
): boolean {
  return exercise.pitch.pitchClass === answer.pitchClass;
}
