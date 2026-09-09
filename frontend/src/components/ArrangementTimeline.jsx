import { useRef, useState } from "react";
import { getPatternLength as getSharedPatternLength } from "../utils/patternTiming";
import "./ArrangementTimeline.css";

const TOTAL_BEATS = 300;
const BEAT_WIDTH = 52;
const TRACK_COUNT = 12;
const TRACK_HEIGHT = 64;
const COLUMN_OFFSET = 1;

export default function ArrangementTimeline({ patterns, arrangement, selectedPatternId, position, isPlaying, onSelectPattern, onAdd, onMove, onRemove, onPlay, onStop, onSeek }) {
  const [draggedPatternId, setDraggedPatternId] = useState(null);
  const [draggedClipId, setDraggedClipId] = useState(null);
  const [draggedClipOffset, setDraggedClipOffset] = useState({ beat: 0, track: 0 });
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekInteractionRef = useRef(false);
  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId);
  const getDropPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      beat: Math.max(0, Math.min(TOTAL_BEATS - 1, Math.floor((event.clientX - rect.left) / BEAT_WIDTH) - COLUMN_OFFSET)),
      track: Math.max(0, Math.min(TRACK_COUNT - 1, Math.floor((event.clientY - rect.top) / TRACK_HEIGHT))),
    };
  };
  const getClipDragOffset = (event, clip) => {
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    return {
      beat: Math.floor((event.clientX - rect.left) / BEAT_WIDTH) - (clip.startBeat + COLUMN_OFFSET),
      track: Math.floor((event.clientY - rect.top) / TRACK_HEIGHT) - (clip.track || 0),
    };
  };
  const seekFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = Math.max(0, (event.clientX - rect.left) / BEAT_WIDTH - COLUMN_OFFSET);
    onSeek(beat);
  };
  const seekFromScale = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = Math.max(0, (event.clientX - rect.left) / BEAT_WIDTH - COLUMN_OFFSET);
    onSeek(beat);
  };

  return (
    <section className="arrangementPanel" aria-label="Playlist arrangement">
      <div className="arrangementHeader">
        <div><span className="playlistKicker">PLAYLIST</span><h2>Arrangement</h2></div>
        <div className="arrangementActions">
          <button className="arrangementPlay" type="button" onClick={isPlaying ? onStop : onPlay}>{isPlaying ? "Stop" : "Play arrangement"}</button>
          <span>{arrangement.length} clips</span>
        </div>
      </div>
      <div className="arrangementBody">
        <div className="arrangementSources">
          <span className="sourceLabel">DRAG TO TIMELINE</span>
          {patterns.map((pattern) => <button className={`sourcePattern ${pattern.id === selectedPatternId ? "selected" : ""}`} draggable type="button" onClick={() => onSelectPattern(pattern.id)} onDragStart={() => setDraggedPatternId(pattern.id)} onDragEnd={() => setDraggedPatternId(null)} key={pattern.id}><i />{pattern.name}<small>{pattern.notes.length} notes</small></button>)}
        </div>
        <div className="timelineScroll">
          <div className="timelineScale" style={{ width: TOTAL_BEATS * BEAT_WIDTH }} onClick={(event) => { event.stopPropagation(); seekFromScale(event); }}>{Array.from({ length: TOTAL_BEATS }, (_, beat) => <span key={beat}>{beat + 1}</span>)}</div>
          <div className="arrangementGrid" style={{ width: TOTAL_BEATS * BEAT_WIDTH }} onPointerMove={(event) => { if (isSeeking) seekFromPointer(event); }} onPointerUp={() => setIsSeeking(false)} onPointerLeave={() => setIsSeeking(false)} onClick={(event) => { if (seekInteractionRef.current) { seekInteractionRef.current = false; event.preventDefault(); return; } if (!event.defaultPrevented && !draggedPatternId && !draggedClipId && !isSeeking && selectedPattern) { const { beat, track } = getDropPosition(event); onAdd(selectedPattern.id, beat, track); } }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const { beat, track } = getDropPosition(event); if (draggedClipId) onMove(draggedClipId, Math.max(0, beat - draggedClipOffset.beat), Math.max(0, Math.min(TRACK_COUNT - 1, track - draggedClipOffset.track))); else if (draggedPatternId) onAdd(draggedPatternId, beat, track); setDraggedPatternId(null); setDraggedClipId(null); }}>
            {Array.from({ length: TOTAL_BEATS }, (_, beat) => <span className={beat % 4 === 0 ? "bar" : ""} key={beat} />)}
            {Array.from({ length: TRACK_COUNT }, (_, track) => <div className="trackLane" style={{ top: track * TRACK_HEIGHT }} key={track}><span>Track {track + 1}</span></div>)}
            {arrangement.map((clip) => { const pattern = patterns.find((item) => item.id === clip.patternId); const length = getSharedPatternLength(pattern); const track = Math.max(0, Math.min(TRACK_COUNT - 1, clip.track || 0)); return <button className={`arrangementClip ${clip.id === selectedClipId ? "selected" : ""} ${clip.id === draggedClipId ? "dragging" : ""}`} style={{ left: (clip.startBeat + COLUMN_OFFSET) * 52, top: track * TRACK_HEIGHT + 7, width: Math.max(52, length * 52 - 4) }} onClick={(event) => { event.stopPropagation(); setSelectedClipId(clip.id); }} onDoubleClick={(event) => { event.stopPropagation(); onRemove(clip.id); }} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); onRemove(clip.id); }} draggable type="button" onDragStart={(event) => { setSelectedClipId(clip.id); setDraggedClipId(clip.id); setDraggedClipOffset(getClipDragOffset(event, clip)); }} onDragEnd={() => { setDraggedClipId(null); setDraggedClipOffset({ beat: 0, track: 0 }); }} key={clip.id}><strong>{pattern?.name || "Pattern"}</strong><small>beat {clip.startBeat + 1}</small><span className="clipDelete" onClick={(event) => { event.stopPropagation(); onRemove(clip.id); }} aria-label="Delete clip">×</span></button>; })}
            <div className="arrangementPlayhead" style={{ left: (position + COLUMN_OFFSET) * 52 }} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); seekInteractionRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); setIsSeeking(true); seekFromPointer(event); }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} />
          </div>
        </div>
      </div>
      <p className="arrangementHint">Select a pattern, then click a slot. Double-click a clip to remove it.</p>
    </section>
  );
}