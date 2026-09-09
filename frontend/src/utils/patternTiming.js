export const BEATS_PER_BAR = 4;

export function getPatternLength(patternOrNotes) {
  const notes = Array.isArray(patternOrNotes) ? patternOrNotes : patternOrNotes?.notes;
  if (!notes?.length) return BEATS_PER_BAR;

  const lastBeat = Math.max(...notes.map((note) => note.beat));
  return Math.max(BEATS_PER_BAR, Math.ceil((lastBeat + 1) / BEATS_PER_BAR) * BEATS_PER_BAR);
}
