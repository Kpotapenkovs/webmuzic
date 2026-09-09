import { useEffect, useRef, useState } from "react";
import { getPatternLength } from "../utils/patternTiming";

export default function useArrangementPlayback({ bpm, patterns, arrangement, onNotePlay }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const frameRef = useRef(null);
  const positionRef = useRef(0);
  const lastBeatRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const patternsRef = useRef(patterns);
  const arrangementRef = useRef(arrangement);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    patternsRef.current = patterns;
    arrangementRef.current = arrangement;
  }, [patterns, arrangement]);

  const getEnd = () => Math.max(0, ...arrangementRef.current.map((clip) => clip.startBeat + getPatternLength(patternsRef.current.find((pattern) => pattern.id === clip.patternId))));

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
        arrangementRef.current.forEach((clip) => {
          const pattern = patternsRef.current.find((item) => item.id === clip.patternId);
          pattern?.notes.filter((note) => clip.startBeat + note.beat === beatToPlay).forEach((note) => onNotePlay(note.row));
        });
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