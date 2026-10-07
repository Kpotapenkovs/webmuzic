import { memo, useEffect, useRef, useState } from "react";
import SeekBar from "./SeekBar";
import { getPatternLength as getSharedPatternLength } from "../utils/patternTiming";
import { MAX_TIMELINE_BEATS } from "../config/studio";
import "./ArrangementTimeline.css";

const TOTAL_BEATS = MAX_TIMELINE_BEATS;
const BEAT_WIDTH = 52;
const TRACK_COUNT = 12;
const TRACK_HEIGHT = 64;
const COLUMN_OFFSET = 1;

const TimelineScaleColumns = memo(function TimelineScaleColumns({ totalBeats }) {
  return <>
    <span className="timelineGutter" aria-hidden="true" />
    {Array.from({ length: totalBeats }, (_, beat) => <span key={beat}>{beat + 1}</span>)}
  </>;
});

const ArrangementColumns = memo(function ArrangementColumns({ totalBeats }) {
  return <>
    <span className="trackGutter" aria-hidden="true" />
    {Array.from({ length: totalBeats }, (_, beat) => <span className={beat % 4 === 0 ? "bar" : ""} key={beat} />)}
  </>;
});

export default function ArrangementTimeline({ patterns, arrangement, selectedPatternId, position, isPlaying, onSelectPattern, onAdd, onMove, onRemove, onPlay, onStop, onSeek, readOnly = false }) {
  const arrangementGridRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const [draggedPatternId, setDraggedPatternId] = useState(null);
  const [draggedClipId, setDraggedClipId] = useState(null);
  const [draggedClipOffset, setDraggedClipOffset] = useState({ beat: 0, track: 0 });
  const [dragPreview, setDragPreview] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekInteractionRef = useRef(false);
  useEffect(() => {
    const scrollArea = timelineScrollRef.current;
    if (!scrollArea) return undefined;
    const handleWheel = (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      scrollArea.scrollLeft += event.deltaY || event.deltaX;
    };
    scrollArea.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollArea.removeEventListener("wheel", handleWheel);
  }, []);

  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId);
  const patternsById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
  const overviewItems = arrangement.map((clip) => ({
    id: clip.id,
    start: clip.startBeat,
    length: getSharedPatternLength(patternsById.get(clip.patternId)),
  }));
  const overviewBeats = Math.min(TOTAL_BEATS, Math.max(4, ...overviewItems.map((item) => item.start + item.length)));
  const getDropPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = Math.floor((event.clientX - rect.left) / BEAT_WIDTH) - COLUMN_OFFSET;
    if (beat < 0 || beat >= TOTAL_BEATS) return null;

    return {
      beat,
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
    const rect = arrangementGridRef.current.getBoundingClientRect();
    const beat = Math.max(0, (event.clientX - rect.left) / BEAT_WIDTH - COLUMN_OFFSET);
    onSeek(beat);
  };
  const seekFromScale = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = Math.max(0, (event.clientX - rect.left) / BEAT_WIDTH - COLUMN_OFFSET);
    onSeek(beat);
  };

  const fitToTimeline = (position, patternId) => {
    if (!position) return null;
    const pattern = patterns.find((item) => item.id === patternId);
    const maxStartBeat = Math.max(0, TOTAL_BEATS - getSharedPatternLength(pattern));
    return { ...position, beat: Math.min(position.beat, maxStartBeat) };
  };

  const getDraggedPatternId = () => arrangement.find((clip) => clip.id === draggedClipId)?.patternId ?? draggedPatternId;

  const getDraggedPosition = (position) => {
    if (!position || !draggedClipId) return position;
    return {
      beat: Math.max(0, position.beat - draggedClipOffset.beat),
      track: Math.max(0, Math.min(TRACK_COUNT - 1, position.track - draggedClipOffset.track)),
    };
  };

  const handleGridClick = (event) => {
    if (seekInteractionRef.current) {
      seekInteractionRef.current = false;
      event.preventDefault();
      return;
    }
    if (event.defaultPrevented || draggedPatternId || draggedClipId || isSeeking || !selectedPattern) return;
    const position = fitToTimeline(getDropPosition(event), selectedPattern.id);
    if (position) onAdd(selectedPattern.id, position.beat, position.track);
  };

  const handleGridDragOver = (event) => {
    event.preventDefault();
    setDragPreview(fitToTimeline(getDraggedPosition(getDropPosition(event)), getDraggedPatternId()));
  };

  const handleGridDrop = (event) => {
    event.preventDefault();
    const position = fitToTimeline(getDraggedPosition(getDropPosition(event)), getDraggedPatternId());
    if (position && draggedClipId) onMove(draggedClipId, position.beat, position.track);
    else if (position && draggedPatternId) onAdd(draggedPatternId, position.beat, position.track);
    setDraggedPatternId(null);
    setDraggedClipId(null);
    setDragPreview(null);
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
      <div className="arrangementScrubber">
        <SeekBar playheadX={position} onSeek={onSeek} onHorizontalScroll={(delta) => { if (timelineScrollRef.current) timelineScrollRef.current.scrollLeft += delta; }} keyboardWidth={92} totalWidth={overviewBeats} totalBeats={overviewBeats} overviewItems={overviewItems} label="LAIKS" sliderLabel="Aranžējuma pozīcija" />
      </div>
      <div className="arrangementBody">
        <div className="arrangementSources">
          <span className="sourceLabel">DRAG TO TIMELINE</span>
          {patterns.map((pattern) => <button className={`sourcePattern ${pattern.id === selectedPatternId ? "selected" : ""}`} draggable={!readOnly} type="button" onClick={() => onSelectPattern(pattern.id)} onDragStart={() => { if (!readOnly) { setDraggedPatternId(pattern.id); setDragPreview(null); } }} onDragEnd={() => { setDraggedPatternId(null); setDragPreview(null); }} key={pattern.id}><i />{pattern.name}<small>{pattern.notes.length} notes</small></button>)}
        </div>
        <div className="timelineScroll" ref={timelineScrollRef}>
          <div className="timelineScale" style={{ width: (TOTAL_BEATS + COLUMN_OFFSET) * BEAT_WIDTH, gridTemplateColumns: `repeat(${TOTAL_BEATS + COLUMN_OFFSET}, ${BEAT_WIDTH}px)` }} onClick={(event) => { event.stopPropagation(); seekFromScale(event); }}><TimelineScaleColumns totalBeats={TOTAL_BEATS} /></div>
          <div className="arrangementGrid" ref={arrangementGridRef} style={{ width: (TOTAL_BEATS + COLUMN_OFFSET) * BEAT_WIDTH, gridTemplateColumns: `repeat(${TOTAL_BEATS + COLUMN_OFFSET}, ${BEAT_WIDTH}px)` }} onClick={handleGridClick} onDragOver={handleGridDragOver} onDrop={handleGridDrop}>
            <ArrangementColumns totalBeats={TOTAL_BEATS} />
            {Array.from({ length: TRACK_COUNT }, (_, track) => <div className="trackLane" style={{ top: track * TRACK_HEIGHT }} key={track}><span>Track {track + 1}</span></div>)}
            {arrangement.map((clip) => { const pattern = patterns.find((item) => item.id === clip.patternId); const length = getSharedPatternLength(pattern); const track = Math.max(0, Math.min(TRACK_COUNT - 1, clip.track || 0)); const isDragged = clip.id === draggedClipId; const beat = isDragged && dragPreview ? dragPreview.beat : clip.startBeat; const previewTrack = isDragged && dragPreview ? dragPreview.track : track; return <button className={`arrangementClip ${clip.id === selectedClipId ? "selected" : ""} ${isDragged ? "dragging" : ""}`} style={{ left: (beat + COLUMN_OFFSET) * BEAT_WIDTH, top: previewTrack * TRACK_HEIGHT + 7, width: Math.max(BEAT_WIDTH, length * BEAT_WIDTH - 4) }} onClick={(event) => { event.stopPropagation(); setSelectedClipId(clip.id); }} onDoubleClick={readOnly ? undefined : (event) => { event.stopPropagation(); onRemove(clip.id); }} onContextMenu={readOnly ? undefined : (event) => { event.preventDefault(); event.stopPropagation(); onRemove(clip.id); }} draggable={!readOnly} type="button" onDragStart={(event) => { if (readOnly) { event.preventDefault(); return; } setSelectedClipId(clip.id); setDraggedClipId(clip.id); setDraggedClipOffset(getClipDragOffset(event, clip)); setDragPreview({ beat: clip.startBeat, track }); }} onDragEnd={() => { setDraggedClipId(null); setDraggedClipOffset({ beat: 0, track: 0 }); setDragPreview(null); }} key={clip.id}><strong>{pattern?.name || "Pattern"}</strong><small>beat {beat + 1}</small>{!readOnly && <span className="clipDelete" onClick={(event) => { event.stopPropagation(); onRemove(clip.id); }} aria-label="Delete clip">×</span>}</button>; })}
            {draggedPatternId && dragPreview && (() => { const pattern = patterns.find((item) => item.id === draggedPatternId); return <div className="arrangementClip dragging dragGhost" aria-hidden="true" style={{ left: (dragPreview.beat + COLUMN_OFFSET) * BEAT_WIDTH, top: dragPreview.track * TRACK_HEIGHT + 7, width: Math.max(BEAT_WIDTH, getSharedPatternLength(pattern) * BEAT_WIDTH - 4) }}><strong>{pattern?.name || "Pattern"}</strong><small>beat {dragPreview.beat + 1}</small></div>; })()}
            <div className={`arrangementPlayhead ${isPlaying ? "playing" : ""}`} style={{ left: (position + COLUMN_OFFSET) * 52 }} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); seekInteractionRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); setIsSeeking(true); seekFromPointer(event); }} onPointerMove={(event) => { if (isSeeking) seekFromPointer(event); }} onPointerUp={(event) => { setIsSeeking(false); event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => setIsSeeking(false)} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} />
          </div>
        </div>
      </div>
      <p className="arrangementHint">Select a pattern, then click a slot. Double-click a clip to remove it.</p>
    </section>
  );
}
