export const BEATS_PER_BAR = 4;

export function getPatternLength(patternOrNotes) {
  const notes = Array.isArray(patternOrNotes) ? patternOrNotes : patternOrNotes?.notes;
  const declaredLength = Array.isArray(patternOrNotes) ? 0 : Number(patternOrNotes?.length) || 0;
  if (!notes?.length) return Math.max(BEATS_PER_BAR, declaredLength);

  const lastEnd = Math.max(...notes.map((note) => note.beat + (note.length || 1)));
  return Math.max(BEATS_PER_BAR, declaredLength, Math.ceil(lastEnd / BEATS_PER_BAR) * BEATS_PER_BAR);
}
