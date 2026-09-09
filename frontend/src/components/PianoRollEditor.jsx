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

export default function PianoRollEditor({ notes, onNotesChange, playback }) {
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const playheadRef = useRef(null);
  const seekMarkerRef = useRef(null);
  const draggingNoteRef = useRef(null);
  const movedNoteRef = useRef(false);
  const erasingRef = useRef(false);
  const { playheadX, setPlayheadX, addNote, removeNote, moveNote, activeBeat } = playback;

  useEffect(() => {
    const transform = `translate3d(${playheadX}px, 0, 0)`;
    if (playheadRef.current) playheadRef.current.style.transform = transform;
    if (seekMarkerRef.current) seekMarkerRef.current.style.transform = transform;
  }, [playheadX]);

  useKeyboardPlay({ onNoteOn: () => {}, onNoteOff: () => {}, volume });

  const totalWidth = TOTAL_BEATS * CELL_WIDTH;
  return (
    <main className="editorPanel">
      <section className="editorToolbar" aria-label="Piano roll controls">
        <label className="volumeControl">
          <span>Volume {Math.round(volume * 100)}%</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
        </label>
        <span className="hintText">Click to add · right-click to remove</span>
      </section>

      <SeekBar playheadX={playheadX} setPlayheadX={setPlayheadX} seekMarkerRef={seekMarkerRef} keyboardWidth={KEYBOARD_WIDTH} totalWidth={totalWidth} />

      <div className="rollViewport">
        <div className="keyboardLabels" aria-hidden="true">
          {Array.from({ length: GRID_ROWS }, (_, row) => {
            const note = getNoteName(row);
            return <div className={`keyLabel ${note.includes("#") ? "blackKey" : ""}`} key={note}>{note}</div>;
          })}
        </div>
        <div
          className="pianoRoll"
          style={{ width: totalWidth, height: GRID_ROWS * CELL_HEIGHT }}
          onClick={(event) => {
            if (movedNoteRef.current) {
              movedNoteRef.current = false;
              return;
            }
            addNote(event, CELL_WIDTH, CELL_HEIGHT);
          }}
          onPointerMove={(event) => {
            if (erasingRef.current) {
              removeNote(event, CELL_WIDTH, CELL_HEIGHT);
              return;
            }
            if (draggingNoteRef.current) {
              movedNoteRef.current = true;
              moveNote(event, CELL_WIDTH, CELL_HEIGHT, draggingNoteRef.current);
            }
          }}
          onPointerDown={(event) => {
            if (event.button === 2) {
              event.preventDefault();
              erasingRef.current = true;
              removeNote(event, CELL_WIDTH, CELL_HEIGHT);
            }
          }}
          onPointerUp={() => { draggingNoteRef.current = null; erasingRef.current = false; }}
          onPointerLeave={() => { draggingNoteRef.current = null; erasingRef.current = false; }}
          onContextMenu={(event) => {
            event.preventDefault();
            removeNote(event, CELL_WIDTH, CELL_HEIGHT);
          }}
        >
          {Array.from({ length: GRID_ROWS }, (_, row) => (
            <div className={`gridRow ${getNoteName(row).includes("#") ? "darkRow" : ""}`} style={{ top: row * CELL_HEIGHT, height: CELL_HEIGHT }} key={row} />
          ))}
          {Array.from({ length: TOTAL_BEATS }, (_, beat) => (
            <div className={`beatLine ${beat % 4 === 0 ? "barLine" : ""}`} style={{ left: beat * CELL_WIDTH }} key={beat} />
          ))}
          <div className="playhead" ref={playheadRef} aria-hidden="true" />
          {notes.map((note) => (
            <div
              className={`placedNote ${activeBeat === note.beat ? "triggered" : ""}`}
              style={{ left: note.beat * CELL_WIDTH, top: note.row * CELL_HEIGHT, width: CELL_WIDTH - 2, height: CELL_HEIGHT - 2 }}
              onPointerDown={(event) => {
                if (event.button === 2) {
                  event.preventDefault();
                  return;
                }
                event.stopPropagation();
                draggingNoteRef.current = note.id;
              }}
              onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); onNotesChange(notes.filter((item) => item.id !== note.id)); }}
              key={note.id}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function getNoteName(row) {
  const midi = 108 - row;
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}