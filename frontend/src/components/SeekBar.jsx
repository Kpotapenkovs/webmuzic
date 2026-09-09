import { useState } from "react";

export default function SeekBar({ playheadX, setPlayheadX, seekMarkerRef, keyboardWidth, totalWidth }) {
  const [isDragging, setIsDragging] = useState(false);
  const movePlayhead = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(totalWidth, event.clientX - rect.left));
    setPlayheadX(nextX);
  };

  return (
    <div className="seekBarRow">
      <div className="seekBarLabel" style={{ width: keyboardWidth }}>TIMELINE</div>
      <div className="seekBar" onClick={movePlayhead} onPointerDown={(event) => { setIsDragging(true); event.currentTarget.setPointerCapture(event.pointerId); movePlayhead(event); }} onPointerMove={(event) => { if (isDragging) movePlayhead(event); }} onPointerUp={() => setIsDragging(false)} role="slider" aria-label="Playback position" aria-valuemin="0" aria-valuemax={totalWidth} aria-valuenow={Math.round(playheadX)} tabIndex="0">
        <div className="seekMarker" ref={seekMarkerRef} />
        {Array.from({ length: 16 }, (_, index) => <span className="seekBeat" style={{ left: index * 240 }} key={index}>{index + 1}</span>)}
      </div>
    </div>
  );
}