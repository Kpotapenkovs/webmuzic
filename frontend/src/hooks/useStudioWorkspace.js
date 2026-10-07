import { useCallback, useState } from "react";
import usePatternStorage from "./usePatternStorage";
import useArrangementPlayback from "./useArrangementPlayback";
import useNoteSound from "./useNoteSound";
import usePianoRoll from "./usePianoRoll";
import { DEFAULT_BPM, DEFAULT_NOTE_VOLUME, MAX_BPM, MAX_TIMELINE_BEATS, MIN_BPM } from "../config/studio";

export default function useStudioWorkspace() {
  const [isPianoRollOpen, setIsPianoRollOpen] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [volume, setVolume] = useState(DEFAULT_NOTE_VOLUME);
  const patternStorage = usePatternStorage();
  const {
    patterns,
    selectedPatternId,
    selectPattern,
    createPattern,
    renamePattern,
    deletePattern,
    updatePatternNotes,
    extendPattern,
    arrangement,
    addToArrangement,
    moveInArrangement,
    removeFromArrangement,
    loadProject: loadPatternProject,
    markSaved,
  } = patternStorage;
  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId) || patterns[0];
  const { playNote, prepareAudio } = useNoteSound(volume);
  const [activeBeat, setActiveBeat] = useState(-1);
  const pianoRollPlayback = usePianoRoll({
    bpm,
    cellWidth: 60,
    totalBeats: MAX_TIMELINE_BEATS,
    gridRows: 88,
    notes: selectedPattern.notes,
    onNotesChange: (notes) => updatePatternNotes(selectedPattern.id, notes),
    onNoteAdd: playNote,
    onNotePlay: playNote,
    onBeatChange: setActiveBeat,
  });
  const arrangementPlayback = useArrangementPlayback({ bpm, patterns, arrangement, onNotePlay: playNote });

  const handleBpmChange = (value) => {
    const normalizedBpm = Math.round(Number(value) || MIN_BPM);
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, normalizedBpm)));
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

  const loadProject = useCallback((projectData, isDirty = false) => {
    const normalizedBpm = Math.round(Number(projectData.bpm) || DEFAULT_BPM);
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, normalizedBpm)));
    loadPatternProject(projectData, isDirty);
    setIsPianoRollOpen(false);
  }, [loadPatternProject]);

  const startPlayback = () => {
    prepareAudio();
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
    ? { ...pianoRollPlayback, playheadX: arrangementPatternPosition * 60, activeBeat: activeClip ? Math.floor(arrangementPatternPosition * 2) : -1 }
    : { ...pianoRollPlayback, activeBeat };

  return {
    isPianoRollOpen,
    bpm,
    volume,
    setVolume,
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
    extendPattern: (id) => extendPattern(id),
    addToArrangement,
    moveInArrangement,
    removeFromArrangement,
    loadProject,
    markSaved,
  };
}
