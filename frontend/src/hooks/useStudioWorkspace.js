import { useState } from "react";
import usePatternStorage from "./usePatternStorage";
import useArrangementPlayback from "./useArrangementPlayback";
import useNoteSound from "./useNoteSound";
import usePianoRoll from "./usePianoRoll";
import { DEFAULT_BPM, DEFAULT_NOTE_VOLUME, MAX_BPM, MIN_BPM } from "../config/studio";

export default function useStudioWorkspace() {
  const [isPianoRollOpen, setIsPianoRollOpen] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const patternStorage = usePatternStorage();
  const {
    patterns,
    selectedPatternId,
    selectPattern,
    createPattern,
    renamePattern,
    deletePattern,
    updatePatternNotes,
    arrangement,
    addToArrangement,
    moveInArrangement,
    removeFromArrangement,
  } = patternStorage;
  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId) || patterns[0];
  const playNote = useNoteSound(DEFAULT_NOTE_VOLUME);
  const [activeBeat, setActiveBeat] = useState(-1);
  const pianoRollPlayback = usePianoRoll({
    bpm,
    cellWidth: 60,
    totalBeats: 300,
    gridRows: 88,
    notes: selectedPattern.notes,
    onNotesChange: (notes) => updatePatternNotes(selectedPattern.id, notes),
    onNoteAdd: playNote,
    onNotePlay: playNote,
    onBeatChange: setActiveBeat,
  });
  const arrangementPlayback = useArrangementPlayback({ bpm, patterns, arrangement, onNotePlay: playNote });

  const handleBpmChange = (value) => {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, Number(value) || MIN_BPM)));
  };

  const handlePatternClick = (patternId) => {
    selectPattern(patternId);
    setIsPianoRollOpen((open) => patternId === selectedPatternId ? !open : true);
  };

  const openPlaylist = () => {
    pianoRollPlayback.stop();
    setIsPianoRollOpen(false);
  };
  const openPianoRoll = () => setIsPianoRollOpen(true);

  const startPlayback = () => {
    if (isPianoRollOpen) {
      arrangementPlayback.stop();
      pianoRollPlayback.start();
      return;
    }
    pianoRollPlayback.stop();
    arrangementPlayback.start();
  };
  const pausePlayback = () => {
    pianoRollPlayback.pause();
    arrangementPlayback.pause();
  };
  const stopPlayback = () => {
    pianoRollPlayback.stop();
    arrangementPlayback.stop();
  };
  const isPlaybackActive = pianoRollPlayback.isPlaying || arrangementPlayback.isPlaying;
  const activeClip = arrangementPlayback.isPlaying && arrangement.find((clip) => {
    const pattern = patterns.find((item) => item.id === clip.patternId);
    const length = arrangementPlayback.getPatternLength(pattern);
    return clip.patternId === selectedPatternId && arrangementPlayback.position >= clip.startBeat && arrangementPlayback.position < clip.startBeat + length;
  });
  const arrangementPatternPosition = activeClip ? arrangementPlayback.position - activeClip.startBeat : 0;
  const pianoRollViewPlayback = arrangementPlayback.isPlaying && !pianoRollPlayback.isPlaying
    ? { ...pianoRollPlayback, playheadX: arrangementPatternPosition * 60, activeBeat: activeClip ? Math.floor(arrangementPatternPosition) : -1 }
    : { ...pianoRollPlayback, activeBeat };

  return {
    isPianoRollOpen,
    bpm,
    selectedPattern,
    patterns,
    selectedPatternId,
    arrangement,
    arrangementPlayback,
    pianoRollPlayback: pianoRollViewPlayback,
    isPlaybackActive,
    startPlayback,
    pausePlayback,
    stopPlayback,
    handleBpmChange,
    handlePatternClick,
    openPlaylist,
    openPianoRoll,
    selectPattern,
    createPattern,
    renamePattern,
    deletePattern,
    updatePatternNotes,
    addToArrangement,
    moveInArrangement,
    removeFromArrangement,
  };
}
