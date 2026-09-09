import { useEffect, useRef, useState } from "react";
import { getPatternLength } from "../utils/patternTiming";

export default function usePianoRoll({ bpm, cellWidth, totalBeats, gridRows, notes, onNotesChange, onNoteAdd, onNotePlay, onPlayheadChange, onBeatChange }) {
  const [playheadX, setPlayheadX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const playheadRef = useRef(0);
  const notesRef = useRef(notes);
  const lastBeatRef = useRef(-1);
  const bpmRef = useRef(bpm);
  const onPlayheadChangeRef = useRef(onPlayheadChange);
  const onBeatChangeRef = useRef(onBeatChange);

  useEffect(() => { notesRef.current = notes; }, [notes]);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  useEffect(() => {
    playheadRef.current = playheadX;
  }, [playheadX]);

  useEffect(() => {
    onPlayheadChangeRef.current = onPlayheadChange;
    onBeatChangeRef.current = onBeatChange;
  }, [onPlayheadChange, onBeatChange]);

  const loopEnd = () => {
    return Math.min(totalBeats * cellWidth, getPatternLength(notes) * cellWidth);
  };

  const start = () => {
    cancelAnimationFrame(animationRef.current);
    setIsPlaying(true);
    lastBeatRef.current = -1;
    let previousTime;
    const animate = (time) => {
      const delta = previousTime ? time - previousTime : 0;
      previousTime = time;
      const nextPosition = playheadRef.current + (cellWidth * bpmRef.current * delta) / 60000;
      const next = nextPosition >= loopEnd() ? 0 : nextPosition;
      const beat = Math.floor(next / cellWidth);

      if (lastBeatRef.current < 0 || beat < lastBeatRef.current) {
        onBeatChangeRef.current?.(beat);
        notesRef.current.filter((note) => note.beat === beat).forEach((note) => onNotePlay?.(note.row));
      } else if (beat > lastBeatRef.current) {
        for (let crossedBeat = lastBeatRef.current + 1; crossedBeat <= beat; crossedBeat += 1) {
          onBeatChangeRef.current?.(crossedBeat);
          notesRef.current.filter((note) => note.beat === crossedBeat).forEach((note) => onNotePlay?.(note.row));
        }
      }
      lastBeatRef.current = beat;

      playheadRef.current = next;
      setPlayheadX(next);
      onPlayheadChangeRef.current?.(next);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const pause = () => {
    cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
  };
  const stop = () => {
    pause();
    playheadRef.current = 0;
    setPlayheadX(0);
    onPlayheadChangeRef.current?.(0);
    onBeatChangeRef.current?.(-1);
  };

  const getPosition = (event, cellWidthValue, cellHeight) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { beat: Math.floor((event.clientX - rect.left) / cellWidthValue), row: Math.floor((event.clientY - rect.top) / cellHeight) };
  };

  const addNote = (event, cellWidthValue, cellHeight) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    if (beat < 0 || beat >= totalBeats || row < 0 || row >= gridRows) return;
    const id = `${row}-${beat}`;
    if (notes.some((note) => note.id === id)) return;
    onNoteAdd?.(row);
    onNotesChange([...notes, { id, row, beat }]);
  };

  const removeNote = (event, cellWidthValue, cellHeight) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    onNotesChange(notes.filter((note) => note.row !== row || note.beat !== beat));
  };

  const moveNote = (event, cellWidthValue, cellHeight, noteId) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    if (beat < 0 || beat >= totalBeats || row < 0 || row >= gridRows) return;
    if (notes.some((note) => note.id !== noteId && note.row === row && note.beat === beat)) return;
    onNotesChange(notes.map((note) => note.id === noteId ? { ...note, row, beat } : note));
  };

  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

  return { notes, playheadX, setPlayheadX, isPlaying, addNote, removeNote, moveNote, start, pause, stop };
}