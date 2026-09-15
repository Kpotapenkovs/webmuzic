import { useEffect, useRef, useState } from "react";
import { getPatternLength } from "../utils/patternTiming";

export default function useArrangementPlayback({ bpm, patterns, arrangement, onNotePlay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const frameRef = useRef(null);
  const positionRef = useRef(0);
  const lastBeatRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const playbackDataRef = useRef({ end: 0, notesByBeat: new Map() });

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
    const notesByBeat = new Map();
    let end = 0;

    arrangement.forEach((clip) => {
      const pattern = patternsById.get(clip.patternId);
      end = Math.max(end, clip.startBeat + getPatternLength(pattern));

      pattern?.notes.forEach((note) => {
        const beat = clip.startBeat + note.beat;
        const notes = notesByBeat.get(beat) ?? [];
        notes.push(note);
        notesByBeat.set(beat, notes);
      });
    });

    playbackDataRef.current = { end, notesByBeat };
  }, [patterns, arrangement]);

  const getEnd = () => playbackDataRef.current.end;

  const stop = () => {
    cancelAnimationFrame(frameRef.current);
    positionRef.current = 0;
    lastBeatRef.current = -1;
    setPosition(0);
    setIsPlaying(false);
  };
  const pause = () => {
    cancelAnimationFrame(frameRef.current);
    setIsPlaying(false);
  };
  const seek = (nextPosition) => {
    const position = Math.max(0, Math.min(getEnd(), nextPosition));
    positionRef.current = position;
    lastBeatRef.current = -1;
    setPosition(position);
  };
  const start = () => {
    cancelAnimationFrame(frameRef.current);
    if (!getEnd()) return;
    setIsPlaying(true);
    let previousTime;
    const animate = (time) => {
      const delta = previousTime ? time - previousTime : 0;
      previousTime = time;
      const end = getEnd();
      const next = positionRef.current + (bpmRef.current * delta) / 60000;
      const reachedEnd = next >= end;
      const currentPosition = reachedEnd ? end : next;
      const beat = Math.floor(currentPosition);
      if (lastBeatRef.current < 0) {
        playBeat(beat);
      } else if (beat > lastBeatRef.current) {
        for (let crossedBeat = lastBeatRef.current + 1; crossedBeat < Math.min(beat + 1, end); crossedBeat += 1) playBeat(crossedBeat);
      }
      lastBeatRef.current = beat;

      function playBeat(beatToPlay) {
        playbackDataRef.current.notesByBeat.get(beatToPlay)?.forEach((note) => onNotePlay(note.row));
      }
      positionRef.current = currentPosition;
      setPosition(currentPosition);
      if (reachedEnd) {
        setIsPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
  return { isPlaying, position, start, pause, stop, seek, getPatternLength, getEnd };
}
