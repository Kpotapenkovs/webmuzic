import { useCallback } from "react";
import useKeyboardPlay from "../hooks/useKeyboardPlay";
import "./App.css";

export default function App() {
  const handleNoteOn = useCallback(() => {}, []);
  const handleNoteOff = useCallback(() => {}, []);

  useKeyboardPlay({
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
  });

  return (
    <div className="appLayout">
      <aside className="playlist" aria-label="Playlist"></aside>
      <main className="row">
      <div className="beatCollumn" aria-hidden="true"></div>
      </main>
    </div>
  );

}