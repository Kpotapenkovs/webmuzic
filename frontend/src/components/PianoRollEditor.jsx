import { useEffect, useRef, useState } from "react";
import SeekBar from "./SeekBar";
import useKeyboardPlay from "../../hooks/useKeyboardPlay";
import "./PianoRollEditor.css";

const GRID_ROWS = 88;
const CELL_HEIGHT = 22;
const CELL_WIDTH = 60;
const TOTAL_BEATS = 300;
const KEYBOARD_WIDTH = 80;
const DEFAULT_VOLUME = 0.5;

export default function PianoRollEditor({ notes, onNotesChange, playback, readOnly = false }) {
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [previewNotes, setPreviewNotes] = useState(null);
  const playheadRef = useRef(null);
  const seekMarkerRef = useRef(null);
  const interactionRef = useRef(null);
  const noteHistoryRef = useRef([]);
  const latestNotesRef = useRef(notes);
  const selectionBoxRef = useRef(null);
  const pianoRollRef = useRef(null);
  const erasingRef = useRef(false);
  const { playheadX, setPlayheadX, addNote, removeNote, activeBeat } = playback;

  useEffect(() => {
    const transform = `translate3d(${playheadX}px, 0, 0)`;
    if (playheadRef.current) playheadRef.current.style.transform = transform;
    if (seekMarkerRef.current) seekMarkerRef.current.style.transform = transform;
  }, [playheadX]);

  useKeyboardPlay({ onNoteOn: () => {}, onNoteOff: () => {}, volume });

  useEffect(() => {
    if (latestNotesRef.current === notes) return;
    noteHistoryRef.current.push(latestNotesRef.current);
    if (noteHistoryRef.current.length > 100) noteHistoryRef.current.shift();
    latestNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (readOnly) return undefined;
    const handleKeys = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']"))) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        const previousNotes = noteHistoryRef.current.pop();
        if (previousNotes) {
          event.preventDefault();
          latestNotesRef.current = previousNotes;
          setSelectedNotes((current) => current.filter((id) => previousNotes.some((note) => note.id === id)));
          onNotesChange(previousNotes);
        }
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setSelectedNotes(notes.map((note) => note.id));
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        const picked = notes.filter((note) => selectedNotes.includes(note.id));
        if (picked.length) setClipboard(picked.map(({ row, beat, length }) => ({ row, beat, length: length || 1 })));
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && clipboard.length) {
        const start = Math.max(0, ...notes.map((note) => note.beat + (note.length || 1)));
        onNotesChange([...notes, ...clipboard.map((note) => ({ ...note, beat: note.beat - Math.min(...clipboard.map((item) => item.beat)) + start, id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))]);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [notes, selectedNotes, clipboard, onNotesChange, readOnly]);

  const totalWidth = TOTAL_BEATS * CELL_WIDTH;
  const finishPointer = (event) => {
    const interaction = interactionRef.current;
    if (interaction && pianoRollRef.current) {
      const rect = pianoRollRef.current.getBoundingClientRect();
      const endX = event.clientX - rect.left; const endY = event.clientY - rect.top;
      if (Math.abs(endX - interaction.startX) + Math.abs(endY - interaction.startY) > 4) interaction.moved = true;
    }
    if (interaction?.type === "select") {
      if (interaction.moved) {
        const rect = pianoRollRef.current.getBoundingClientRect();
        const endX = event.clientX - rect.left; const endY = event.clientY - rect.top;
        const box = selectionBoxRef.current ?? { left: Math.min(interaction.startX, endX), top: Math.min(interaction.startY, endY), width: Math.abs(endX - interaction.startX), height: Math.abs(endY - interaction.startY) };
        const selected = notes.filter((note) => {
          const left = note.beat * CELL_WIDTH; const top = note.row * CELL_HEIGHT;
          const right = left + (note.length || 1) * CELL_WIDTH; const bottom = top + CELL_HEIGHT;
          return box && left <= box.left + box.width && right >= box.left && top <= box.top + box.height && bottom >= box.top;
        }).map((note) => note.id);
        setSelectedNotes(interaction.additive ? [...new Set([...interaction.initial, ...selected])] : selected);
      } else addNote(event, CELL_WIDTH, CELL_HEIGHT);
    } else if (interaction?.type === "move" && interaction.moved && interaction.preview) {
      onNotesChange(interaction.preview);
    }
    interactionRef.current = null;
    selectionBoxRef.current = null;
    setSelectionBox(null);
    setPreviewNotes(null);
    erasingRef.current = false;
  };

  return (
    <main className="editorPanel">
      <section className="editorToolbar" aria-label="Piano roll controls">
        <label className="volumeControl"><span>Volume {Math.round(volume * 100)}%</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
        <span className="hintText">Klikšķis: pievienot · velciet fonā: izcelt · Ctrl+A: visas · Ctrl+C/V: kopēt/ielīmēt</span>
      </section>
      <SeekBar playheadX={playheadX} setPlayheadX={setPlayheadX} seekMarkerRef={seekMarkerRef} keyboardWidth={KEYBOARD_WIDTH} totalWidth={totalWidth} />
      <div className="rollViewport">
        <div className="keyboardLabels" aria-hidden="true">{Array.from({ length: GRID_ROWS }, (_, row) => { const note = getNoteName(row); return <div className={`keyLabel ${note.includes("#") ? "blackKey" : ""}`} key={note}>{note}</div>; })}</div>
        <div ref={pianoRollRef} className={`pianoRoll ${readOnly ? "readOnly" : ""}`} style={{ width: totalWidth, height: GRID_ROWS * CELL_HEIGHT }}
          onPointerMove={(event) => {
            if (readOnly) return;
            if (erasingRef.current) { removeNote(event, CELL_WIDTH, CELL_HEIGHT); return; }
            const interaction = interactionRef.current;
            if (!interaction) return;
            const rect = event.currentTarget.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top;
            if (Math.abs(x - interaction.startX) + Math.abs(y - interaction.startY) > 4) interaction.moved = true;
            if (interaction.type === "select") {
              const box = { left: Math.min(interaction.startX, x), top: Math.min(interaction.startY, y), width: Math.abs(x - interaction.startX), height: Math.abs(y - interaction.startY) };
              selectionBoxRef.current = box;
              setSelectionBox(box);
            } else if (interaction.type === "move") {
              const deltaBeat = Math.round((x - interaction.startX) / (CELL_WIDTH / 2)) / 2; const deltaRow = Math.round((y - interaction.startY) / CELL_HEIGHT); const ids = new Set(interaction.ids);
              const moved = interaction.original.map((note) => ids.has(note.id) ? { ...note, beat: Math.max(0, Math.min(TOTAL_BEATS - (note.length || 1), note.beat + deltaBeat)), row: Math.max(0, Math.min(GRID_ROWS - 1, note.row + deltaRow)) } : note);
              const moving = moved.filter((note) => ids.has(note.id)); const stationary = moved.filter((note) => !ids.has(note.id));
              const valid = moving.every((note) => !stationary.some((other) => other.row === note.row && note.beat < other.beat + (other.length || 1) && note.beat + (note.length || 1) > other.beat));
              interaction.preview = valid ? moved : null; setPreviewNotes(interaction.preview);
            }
          }}
          onPointerDown={(event) => {
            if (readOnly) return;
            if (event.button === 0) event.preventDefault();
            interactionRef.current = null;
            selectionBoxRef.current = null;
            if (event.button === 2) { event.preventDefault(); erasingRef.current = true; try { event.currentTarget.setPointerCapture(event.pointerId); } catch {} removeNote(event, CELL_WIDTH, CELL_HEIGHT); return; }
            const rect = event.currentTarget.getBoundingClientRect(); const startX = event.clientX - rect.left; const startY = event.clientY - rect.top;
            const noteElement = event.target.closest("[data-note-id]");
            if (noteElement) {
              const id = noteElement.dataset.noteId; const isSelected = selectedNotes.includes(id);
              const selection = event.shiftKey ? (isSelected ? selectedNotes.filter((item) => item !== id) : [...selectedNotes, id]) : (isSelected ? selectedNotes : [id]);
              setSelectedNotes(selection);
              if (!event.shiftKey || isSelected) interactionRef.current = { type: "move", ids: selection.includes(id) ? selection : [], original: notes, startX, startY, moved: false, pointerId: event.pointerId };
            } else interactionRef.current = { type: "select", startX, startY, moved: false, additive: event.shiftKey, initial: selectedNotes, pointerId: event.pointerId };
            try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
          }}
          onPointerUp={readOnly ? undefined : finishPointer}
          onPointerCancel={readOnly ? undefined : () => { interactionRef.current = null; selectionBoxRef.current = null; setSelectionBox(null); setPreviewNotes(null); erasingRef.current = false; }}
          onContextMenu={readOnly ? undefined : (event) => { event.preventDefault(); removeNote(event, CELL_WIDTH, CELL_HEIGHT); }}>
          {Array.from({ length: GRID_ROWS }, (_, row) => <div className={`gridRow ${getNoteName(row).includes("#") ? "darkRow" : ""}`} style={{ top: row * CELL_HEIGHT, height: CELL_HEIGHT }} key={row} />)}
          {Array.from({ length: TOTAL_BEATS * 2 }, (_, step) => <div className={`beatLine ${step % 2 === 1 ? "subBeatLine" : Math.floor(step / 2) % 4 === 0 ? "barLine" : ""}`} style={{ left: step * (CELL_WIDTH / 2) }} key={step} />)}
          <div className="playhead" ref={playheadRef} aria-hidden="true" />
          {selectionBox && <div className="noteSelectionBox" style={selectionBox} />}
          {(previewNotes || notes).map((note) => <div className={`placedNote ${activeBeat === Math.floor(note.beat) ? "triggered" : ""} ${selectedNotes.includes(note.id) ? "selected" : ""}`} data-note-id={readOnly ? undefined : note.id} style={{ left: note.beat * CELL_WIDTH, top: note.row * CELL_HEIGHT, width: Math.max(12, (note.length || 1) * CELL_WIDTH - 2), height: CELL_HEIGHT - 2 }} onContextMenu={readOnly ? undefined : (event) => { event.preventDefault(); event.stopPropagation(); onNotesChange(notes.filter((item) => item.id !== note.id)); setSelectedNotes((current) => current.filter((id) => id !== note.id)); }} key={note.id}>{!readOnly && <span className="noteResize" onPointerDown={(event) => {
            event.stopPropagation(); event.preventDefault();
            const handle = event.currentTarget; const noteElement = handle.parentElement; const startX = event.clientX; const originalLength = note.length || 1;
            let nextLength = originalLength;
            const resize = (moveEvent) => {
              nextLength = Math.max(0.5, originalLength + Math.round((moveEvent.clientX - startX) / (CELL_WIDTH / 2)) / 2);
              noteElement.style.width = `${Math.max(12, nextLength * CELL_WIDTH - 2)}px`;
            };
            const finish = () => {
              window.removeEventListener("pointermove", resize); window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", cancel);
              onNotesChange(notes.map((item) => item.id === note.id ? { ...item, length: nextLength } : item));
            };
            const cancel = () => {
              window.removeEventListener("pointermove", resize); window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", cancel);
              noteElement.style.width = `${Math.max(12, originalLength * CELL_WIDTH - 2)}px`;
            };
            window.addEventListener("pointermove", resize); window.addEventListener("pointerup", finish, { once: true }); window.addEventListener("pointercancel", cancel, { once: true });
          }} />}</div>)}
        </div>
      </div>
    </main>
  );
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function getNoteName(row) { const midi = 108 - row; return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`; }
