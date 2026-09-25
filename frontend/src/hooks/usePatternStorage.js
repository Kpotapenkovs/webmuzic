import { useEffect, useState } from "react";

const DEFAULT_PATTERN = { id: "pattern-1", name: "Pattern 1", notes: [] };

export default function usePatternStorage() {
  const [patterns, setPatterns] = useState([DEFAULT_PATTERN]);
  const [selectedPatternId, setSelectedPatternId] = useState(DEFAULT_PATTERN.id);
  const [arrangement, setArrangement] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;

    const confirmExit = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", confirmExit);
    return () => window.removeEventListener("beforeunload", confirmExit);
  }, [hasUnsavedChanges]);

  const selectPattern = (id) => setSelectedPatternId(id);
  const createPattern = () => {
    const id = `pattern-${Date.now()}`;
    setPatterns((current) => {
      const next = [...current, { id, name: `Pattern ${current.length + 1}`, notes: [] }];
      return next;
    });
    setHasUnsavedChanges(true);
    setSelectedPatternId(id);
  };
  const renamePattern = (id, name) => {
    const cleanName = name.trim();
      if (!cleanName) return;
      setPatterns((current) => {
        const next = current.map((pattern) => pattern.id === id ? { ...pattern, name: cleanName } : pattern);
        return next;
      });
    setHasUnsavedChanges(true);
  };
  const deletePattern = (id) => {
    setPatterns((current) => {
      if (current.length === 1) return current;
      const next = current.filter((pattern) => pattern.id !== id);
      if (id === selectedPatternId) setSelectedPatternId(next[0].id);
      return next;
    });
    setHasUnsavedChanges(true);
  };
  const updatePatternNotes = (id, notes) => {
    setPatterns((current) => {
      const next = current.map((pattern) => pattern.id === id ? { ...pattern, notes } : pattern);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const addToArrangement = (patternId, startBeat, track = 0) => {
    setArrangement((current) => {
      const next = [...current, { id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, patternId, startBeat, track }];
      return next;
    });
    setHasUnsavedChanges(true);
  };
  const moveInArrangement = (clipId, startBeat, track) => {
    setArrangement((current) => {
      const next = current.map((clip) => clip.id === clipId ? { ...clip, startBeat, track } : clip);
      return next;
    });
    setHasUnsavedChanges(true);
  };
  const removeFromArrangement = (clipId) => {
    setArrangement((current) => {
      const next = current.filter((clip) => clip.id !== clipId);
      return next;
    });
    setHasUnsavedChanges(true);
  };
  const extendPattern = (id) => {
    setPatterns((current) => current.map((pattern) => pattern.id === id ? { ...pattern, length: (pattern.length || 4) + 4 } : pattern));
    setHasUnsavedChanges(true);
  };

  const loadProject = (projectData, isDirty = false) => {
    const nextPatterns = Array.isArray(projectData.patterns) && projectData.patterns.length > 0
      ? projectData.patterns
      : [DEFAULT_PATTERN];
    const selectedPatternExists = nextPatterns.some((pattern) => pattern.id === projectData.selectedPatternId);

    setPatterns(nextPatterns);
    setSelectedPatternId(selectedPatternExists ? projectData.selectedPatternId : nextPatterns[0].id);
    setArrangement(Array.isArray(projectData.arrangement) ? projectData.arrangement : []);
    setHasUnsavedChanges(isDirty);
  };

  const markSaved = () => setHasUnsavedChanges(false);

  return { patterns, selectedPatternId, selectPattern, createPattern, renamePattern, deletePattern, updatePatternNotes, extendPattern, arrangement, addToArrangement, moveInArrangement, removeFromArrangement, loadProject, markSaved };
}
