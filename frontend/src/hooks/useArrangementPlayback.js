import { useEffect, useRef, useState } from "react";
import { BEATS_PER_BAR, getPatternLength } from "../utils/patternTiming";
import { MAX_TIMELINE_BEATS } from "../config/studio";

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

    const playbackEnd = Math.ceil(end / BEATS_PER_BAR) * BEATS_PER_BAR;
    playbackDataRef.current = { end: playbackEnd, notesByBeat };
    const maxPosition = playbackEnd || MAX_TIMELINE_BEATS;
    if (positionRef.current > maxPosition) {
      positionRef.current = maxPosition;
      setPosition(maxPosition);
    }
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
    const maxPosition = getEnd() || MAX_TIMELINE_BEATS;
    const position = Math.max(0, Math.min(maxPosition, nextPosition));
    positionRef.current = position;
    lastStepRef.current = -1;
    setPosition(position);
  };
  const start = () => {
    cancelAnimationFrame(frameRef.current);
    const end = getEnd();
    if (!end) return;

    if (positionRef.current >= end) {
      positionRef.current = 0;
      lastStepRef.current = -1;
      setPosition(0);
    }

    setIsPlaying(true);
    let previousTime;
    const animate = (time) => {
      const delta = previousTime ? time - previousTime : 0;
      previousTime = time;
      const next = positionRef.current + (bpmRef.current * delta) / 60000;
      const endPosition = getEnd();
      const wrapped = next >= endPosition;
      const currentPosition = wrapped ? next % endPosition : next;

      const step = Math.floor(currentPosition * 2);

      if (wrapped && lastStepRef.current >= 0) {
        for (let crossedStep = lastStepRef.current + 1; crossedStep < endPosition * 2; crossedStep += 1) {
          playStep(crossedStep);
        }
        for (let crossedStep = 0; crossedStep <= step; crossedStep += 1) {
          playStep(crossedStep);
        }
      } else if (lastStepRef.current < 0) {
        playStep(step);
      } else if (step > lastStepRef.current) {
        for (let crossedStep = lastStepRef.current + 1; crossedStep <= step; crossedStep += 1) {
          playStep(crossedStep);
        }
      }

      lastStepRef.current = step;

      function playStep(stepToPlay) {
        playbackDataRef.current.notesByBeat.get(stepToPlay)?.forEach((note) => onNotePlay(note));
      }

      positionRef.current = currentPosition;
      setPosition(currentPosition);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate(performance.now());
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);
  return { isPlaying, position, start, pause, stop, seek, getPatternLength, getEnd };
}
