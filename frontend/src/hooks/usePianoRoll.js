import { useEffect, useRef, useState } from "react";
import { getPatternLength } from "../utils/patternTiming";

export default function usePianoRoll({ bpm, cellWidth, totalBeats, gridRows, notes, onNotesChange, onNoteAdd, onNotePlay, onPlayheadChange, onBeatChange }) {
  const [playheadX, setPlayheadX] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const playheadRef = useRef(0);
  const notesRef = useRef(notes);
  const lastStepRef = useRef(-1);
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
    lastStepRef.current = -1;
    let previousTime;
    const animate = (time) => {
      const delta = previousTime ? time - previousTime : 0;
      previousTime = time;
      const nextPosition = playheadRef.current + (cellWidth * bpmRef.current * delta) / 60000;
      const next = nextPosition >= loopEnd() ? 0 : nextPosition;
      const step = Math.floor(next / (cellWidth / 2));
      const beat = Math.floor(step / 2);
      const playStep = (stepToPlay) => {
        notesRef.current.filter((note) => Math.round(note.beat * 2) === stepToPlay).forEach((note) => onNotePlay?.(note.row));
        if (stepToPlay % 2 === 0) onBeatChangeRef.current?.(stepToPlay / 2);
      };

      if (lastStepRef.current < 0 || step < lastStepRef.current) {
        playStep(step);
      } else if (step > lastStepRef.current) {
        for (let crossedStep = lastStepRef.current + 1; crossedStep <= step; crossedStep += 1) playStep(crossedStep);
      }
      lastStepRef.current = step;

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
    return { beat: Math.floor((event.clientX - rect.left) / (cellWidthValue / 2)) / 2, row: Math.floor((event.clientY - rect.top) / cellHeight) };
  };

  const addNote = (event, cellWidthValue, cellHeight) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    if (beat < 0 || beat >= totalBeats || row < 0 || row >= gridRows) return;
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (notes.some((note) => note.row === row && beat < note.beat + (note.length || 1) && beat >= note.beat)) return;
    onNoteAdd?.(row);
    onNotesChange([...notes, { id, row, beat, length: 0.5 }]);
  };

  const removeNote = (event, cellWidthValue, cellHeight) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    onNotesChange(notes.filter((note) => note.row !== row || beat < note.beat || beat >= note.beat + (note.length || 1)));
  };

  const moveNote = (event, cellWidthValue, cellHeight, noteId) => {
    const { beat, row } = getPosition(event, cellWidthValue, cellHeight);
    if (beat < 0 || beat >= totalBeats || row < 0 || row >= gridRows) return;
    const movingNote = notes.find((note) => note.id === noteId);
    if (!movingNote || notes.some((note) => note.id !== noteId && note.row === row && beat < note.beat + (note.length || 1) && beat + (movingNote.length || 1) > note.beat)) return;
    onNotesChange(notes.map((note) => note.id === noteId ? { ...note, row, beat } : note));
  };

  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

  return { notes, playheadX, setPlayheadX, isPlaying, addNote, removeNote, moveNote, start, pause, stop };
}
