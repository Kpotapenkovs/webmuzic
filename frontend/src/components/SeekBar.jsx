import { useEffect, useRef, useState } from "react";

export default function SeekBar({ playheadX, onSeek, onHorizontalScroll, keyboardWidth, totalWidth, totalBeats, overviewItems = [], label = "TIMELINE", sliderLabel = "Playback position" }) {
  const [isDragging, setIsDragging] = useState(false);
  const seekBarRef = useRef(null);
  const movePlayhead = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    onSeek(progress * totalWidth);
  };
  const moveWithKeyboard = (event) => {
    const stepWidth = totalWidth / totalBeats / 2;
    let nextPosition = playheadX;
    if (event.key === "ArrowLeft") nextPosition -= stepWidth;
    else if (event.key === "ArrowRight") nextPosition += stepWidth;
    else if (event.key === "Home") nextPosition = 0;
    else if (event.key === "End") nextPosition = totalWidth;
    else return;
    event.preventDefault();
    onSeek(Math.max(0, Math.min(totalWidth, nextPosition)));
  };
  const markerCount = Math.min(9, Math.ceil(totalBeats / 4) + 1);
  const positionInBeats = Number(((playheadX / totalWidth) * totalBeats).toFixed(1));

  useEffect(() => {
    const seekBar = seekBarRef.current;
    if (!seekBar) return undefined;
    const handleWheel = (event) => {
      const delta = event.deltaY || event.deltaX;
      if (!delta) return;
      event.preventDefault();
      if (event.ctrlKey) {
        event.stopPropagation();
        onHorizontalScroll?.(delta);
        return;
      }
      const stepWidth = totalWidth / totalBeats / 2;
      onSeek(Math.max(0, Math.min(totalWidth, playheadX + (delta * stepWidth) / 80)));
    };
    seekBar.addEventListener("wheel", handleWheel, { passive: false });
    return () => seekBar.removeEventListener("wheel", handleWheel);
  }, [onHorizontalScroll, onSeek, playheadX, totalBeats, totalWidth]);

  return (
    <div className="seekBarRow">
      <div className="seekBarLabel" style={{ width: keyboardWidth }}>{label}</div>
      <div className="seekBar" ref={seekBarRef} onClick={movePlayhead} onKeyDown={moveWithKeyboard} onPointerDown={(event) => { setIsDragging(true); event.currentTarget.setPointerCapture(event.pointerId); movePlayhead(event); }} onPointerMove={(event) => { if (isDragging) movePlayhead(event); }} onPointerUp={(event) => { setIsDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => setIsDragging(false)} role="slider" aria-label={sliderLabel} aria-valuemin="0" aria-valuemax={totalBeats} aria-valuenow={positionInBeats} aria-valuetext={`${positionInBeats} beats`} tabIndex="0">
        {overviewItems.map((item) => {
          const left = Math.max(0, Math.min(100, (item.start / totalWidth) * 100));
          const width = Math.max(0.5, Math.min(100 - left, (item.length / totalWidth) * 100));
          return <span className="seekOverviewItem" style={{ left: `${left}%`, width: `${width}%` }} key={item.id} aria-hidden="true" />;
        })}
        <div className="seekMarker" style={{ left: `${(playheadX / totalWidth) * 100}%` }} />
        {Array.from({ length: markerCount }, (_, index) => {
          const progress = index / (markerCount - 1);
          const beat = Math.min(totalBeats, Math.round(progress * (totalBeats - 1)) + 1);
          return <span className="seekBeat" style={{ left: `${progress * 100}%` }} key={index}>{beat}</span>;
        })}
      </div>
    </div>
  );
}