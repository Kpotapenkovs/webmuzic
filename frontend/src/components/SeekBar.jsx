import { useEffect, useRef, useState } from "react";

export default function SeekBar({ playheadX, onSeek, onHorizontalScroll, keyboardWidth, totalWidth, totalBeats, overviewItems = [], label = "TIMELINE", sliderLabel = "Playback position", scrollBarMode = false, interactionMax = 0, viewportWidth = 0 }) {
  const [isDragging, setIsDragging] = useState(false);
  const seekBarRef = useRef(null);
  const dragOriginRef = useRef({ pointerX: 0, thumbLeftPx: 0 });
  const viewportPercent = scrollBarMode && totalWidth > 0 ? Math.min(100, (viewportWidth / totalWidth) * 100) : 0;
  const thumbWidth = `${viewportPercent}%`;
  const thumbLeft = interactionMax > 0 ? `${(playheadX / interactionMax) * (100 - viewportPercent)}%` : "0%";
  const moveViewport = (clientX) => {
    const rect = seekBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || interactionMax <= 0) return;
    const thumbWidthPx = seekBarRef.current.querySelector(".scrollViewportThumb")?.getBoundingClientRect().width ?? (viewportPercent / 100) * rect.width;
    const availableTrackWidth = rect.width - thumbWidthPx;
    if (availableTrackWidth <= 0) return;
    const pointerDelta = clientX - dragOriginRef.current.pointerX;
    const thumbLeftPx = Math.max(0, Math.min(
      availableTrackWidth,
      dragOriginRef.current.thumbLeftPx + pointerDelta,
    ));
    onSeek((thumbLeftPx / availableTrackWidth) * interactionMax);
  };
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
  const handleKeyDown = (event) => {
    if (scrollBarMode) {
      const step = Math.max(1, totalWidth / totalBeats);
      let nextPosition = playheadX;
      if (event.key === "ArrowLeft") nextPosition -= step;
      else if (event.key === "ArrowRight") nextPosition += step;
      else if (event.key === "Home") nextPosition = 0;
      else if (event.key === "End") nextPosition = interactionMax;
      else return;
      event.preventDefault();
      onSeek(Math.max(0, Math.min(interactionMax, nextPosition)));
      return;
    }
    moveWithKeyboard(event);
  };

  useEffect(() => {
    const seekBar = seekBarRef.current;
    if (!seekBar) return undefined;
    const handleWheel = (event) => {
      const delta = event.deltaY || event.deltaX;
      if (!delta) return;
      event.preventDefault();
      if (scrollBarMode) {
        event.stopPropagation();
        onSeek(Math.max(0, Math.min(interactionMax, playheadX + delta)));
        return;
      }
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
  }, [interactionMax, onHorizontalScroll, onSeek, playheadX, scrollBarMode, totalBeats, totalWidth]);

  return (
    <div className={`seekBarRow ${scrollBarMode ? "scrollBarRow" : ""}`}>
      <div className="seekBarLabel" style={{ width: keyboardWidth }}>{label}</div>
      <div className={`seekBar ${scrollBarMode ? "scrollBarOverview" : ""}`} ref={seekBarRef} onClick={scrollBarMode ? undefined : movePlayhead} onKeyDown={handleKeyDown} onPointerDown={scrollBarMode ? (event) => {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();
        const thumb = event.target.closest(".scrollViewportThumb");
        const thumbWidthPx = thumb?.getBoundingClientRect().width ?? (viewportPercent / 100) * rect.width;
        const availableTrackWidth = Math.max(0, rect.width - thumbWidthPx);
        const thumbLeftPx = thumb
          ? thumb.getBoundingClientRect().left - rect.left
          : Math.max(0, Math.min(availableTrackWidth, event.clientX - rect.left - thumbWidthPx / 2));
        dragOriginRef.current = {
          pointerX: event.clientX,
          thumbLeftPx,
        };
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        if (!thumb && interactionMax > 0) {
          onSeek((thumbLeftPx / availableTrackWidth) * interactionMax);
        }
      } : (event) => { setIsDragging(true); event.currentTarget.setPointerCapture(event.pointerId); movePlayhead(event); }} onPointerMove={(event) => {
        if (!isDragging) return;
        if (scrollBarMode) moveViewport(event.clientX);
        else movePlayhead(event);
      }} onPointerUp={(event) => { setIsDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={(event) => { setIsDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} role={scrollBarMode ? "scrollbar" : "slider"} aria-label={sliderLabel} aria-orientation="horizontal" aria-valuemin="0" aria-valuemax={scrollBarMode ? interactionMax : totalBeats} aria-valuenow={scrollBarMode ? Math.round(playheadX) : positionInBeats} aria-valuetext={scrollBarMode ? `${Math.round(playheadX)} pixels` : `${positionInBeats} beats`} tabIndex="0">
        {overviewItems.map((item) => {
          const left = Math.max(0, Math.min(100, (item.start / totalWidth) * 100));
          const width = Math.max(0.5, Math.min(100 - left, (item.length / totalWidth) * 100));
          return <span className="seekOverviewItem" style={{ left: `${left}%`, width: `${width}%` }} key={item.id} aria-hidden="true" />;
        })}
        {scrollBarMode ? <div className="scrollViewportThumb" style={{ left: thumbLeft, width: thumbWidth }} aria-hidden="true" /> : <div className="seekMarker" style={{ left: `${(playheadX / totalWidth) * 100}%` }} />}
        {Array.from({ length: markerCount }, (_, index) => {
          const progress = index / (markerCount - 1);
          const beat = Math.min(totalBeats, Math.round(progress * (totalBeats - 1)) + 1);
          return <span className="seekBeat" style={{ left: `${progress * 100}%` }} key={index}>{beat}</span>;
        })}
      </div>
    </div>
  );
}