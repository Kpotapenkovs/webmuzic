import { useEffect, useRef, useState } from "react";
import { getPatternLength } from "../utils/patternTiming";

export default function useArrangementPlayback({ bpm, patterns, arrangement, onNotePlay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const frameRef = useRef(null);
  const positionRef = useRef(0);
  const lastStepRef = useRef(-1);
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
        const step = Math.round((clip.startBeat + note.beat) * 2);
        const notes = notesByBeat.get(step) ?? [];
        notes.push(note);
        notesByBeat.set(step, notes);
      });
    });

    playbackDataRef.current = { end, notesByBeat };
  }, [patterns, arrangement]);

  const getEnd = () => playbackDataRef.current.end;

  const stop = () => {
    cancelAnimationFrame(frameRef.current);
    positionRef.current = 0;
    lastStepRef.current = -1;
    setPosition(0);
    setIsPlaying(false);
  };
  const pause = () => {
    cancelAnimationFrame(frameRef.current);
    setIsPlaying(false);
  };
  const seek = (nextPosition) => {
    const position = Math.max(0, Math.min(300, nextPosition));
    positionRef.current = position;
    lastStepRef.current = -1;
    setPosition(position);
  };
  const start = () => {
    cancelAnimationFrame(frameRef.current);
    if (!getEnd()) return;
    if (positionRef.current >= getEnd()) {
      positionRef.current = 0;
      lastBeatRef.current = -1;
      setPosition(0);
    }
    setIsPlaying(true);
    let previousTime;
    const animate = (time) => {
      const delta = previousTime ? time - previousTime : 0;
      previousTime = time;
      const end = getEnd();
      const next = positionRef.current + (bpmRef.current * delta) / 60000;
      const reachedEnd = next >= end;
      const currentPosition = reachedEnd ? next % end : next;
      const step = Math.floor(currentPosition * 2);
      if (reachedEnd && lastStepRef.current >= 0) {
        for (let crossedStep = lastStepRef.current + 1; crossedStep < Math.ceil(end * 2); crossedStep += 1) playStep(crossedStep);
        for (let crossedStep = 0; crossedStep <= step; crossedStep += 1) playStep(crossedStep);
      } else if (lastStepRef.current < 0) {
        playStep(step);
      } else if (step > lastStepRef.current) {
        for (let crossedStep = lastStepRef.current + 1; crossedStep <= step; crossedStep += 1) playStep(crossedStep);
      }
      lastStepRef.current = step;

      function playStep(stepToPlay) {
        playbackDataRef.current.notesByBeat.get(stepToPlay)?.forEach((note) => onNotePlay(note.row));
      }
      positionRef.current = currentPosition;
      setPosition(currentPosition);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
  return { isPlaying, position, start, pause, stop, seek, getPatternLength, getEnd };
}
