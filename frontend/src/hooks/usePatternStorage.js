import { useEffect, useState } from "react";

const STORAGE_KEY = "webmuzic.patterns.v1";
const ARRANGEMENT_KEY = "webmuzic.arrangement.v1";
const DEFAULT_PATTERN = { id: "pattern-1", name: "Pattern 1", notes: [] };

function readPatterns() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [DEFAULT_PATTERN];
  } catch {
    return [DEFAULT_PATTERN];
  }
}

function savePatterns(patterns) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch {
  }
}

function readArrangement() {
  try {
    const saved = window.localStorage.getItem(ARRANGEMENT_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArrangement(arrangement) {
  try {
    window.localStorage.setItem(ARRANGEMENT_KEY, JSON.stringify(arrangement));
  } catch {
  }
}

export default function usePatternStorage() {
  const [patterns, setPatterns] = useState(() => {
    const saved = readPatterns();
    return saved;
  });
  const [selectedPatternId, setSelectedPatternId] = useState(() => readPatterns()[0].id);
  const [arrangement, setArrangement] = useState(readArrangement);

  useEffect(() => {
    savePatterns(patterns);
  }, [patterns]);

  useEffect(() => {
    saveArrangement(arrangement);
  }, [arrangement]);

  const selectPattern = (id) => setSelectedPatternId(id);
  const createPattern = () => {
    const id = `pattern-${Date.now()}`;
    setPatterns((current) => {
      const next = [...current, { id, name: `Pattern ${current.length + 1}`, notes: [] }];
      savePatterns(next);
      return next;
    });
    setSelectedPatternId(id);
  };
  const renamePattern = (id, name) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setPatterns((current) => {
      const next = current.map((pattern) => pattern.id === id ? { ...pattern, name: cleanName } : pattern);
      savePatterns(next);
      return next;
    });
  };
  const deletePattern = (id) => {
    setPatterns((current) => {
      if (current.length === 1) return current;
      const next = current.filter((pattern) => pattern.id !== id);
      savePatterns(next);
      if (id === selectedPatternId) setSelectedPatternId(next[0].id);
      return next;
    });
  };
  const updatePatternNotes = (id, notes) => {
    setPatterns((current) => {
      const next = current.map((pattern) => pattern.id === id ? { ...pattern, notes } : pattern);
      savePatterns(next);
      return next;
    });
  };

  const addToArrangement = (patternId, startBeat, track = 0) => {
    setArrangement((current) => {
      const next = [...current, { id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, patternId, startBeat, track }];
      saveArrangement(next);
      return next;
    });
  };
  const moveInArrangement = (clipId, startBeat, track) => {
    setArrangement((current) => {
      const next = current.map((clip) => clip.id === clipId ? { ...clip, startBeat, track } : clip);
      saveArrangement(next);
      return next;
    });
  };
  const removeFromArrangement = (clipId) => {
    setArrangement((current) => {
      const next = current.filter((clip) => clip.id !== clipId);
      saveArrangement(next);
      return next;
    });
  };

  return { patterns, selectedPatternId, selectPattern, createPattern, renamePattern, deletePattern, updatePatternNotes, arrangement, addToArrangement, moveInArrangement, removeFromArrangement };
}
