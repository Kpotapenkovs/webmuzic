import PianoRollEditor from "./components/PianoRollEditor";
import PatternPlaylist from "./components/PatternPlaylist";
import ArrangementTimeline from "./components/ArrangementTimeline";
import useStudioWorkspace from "./hooks/useStudioWorkspace";
import useSessionUser from "./hooks/useSessionUser";
import useProjectPersistence from "./hooks/useProjectPersistence";
import "./App.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export default function App() {
  const workspace = useStudioWorkspace();
  const { isLoading: isSessionLoading, user, logout } = useSessionUser();
  const { isLoading: isProjectLoading, isSaving, save } = useProjectPersistence(workspace);
  const {
    isPianoRollOpen,
    bpm,
    selectedPattern,
    patterns,
    selectedPatternId,
    arrangement,
    arrangementPlayback,
    pianoRollPlayback,
    isPlaybackActive,
    startPlayback,
    pausePlayback,
    stopPlayback,
    handleBpmChange,
    handlePatternClick,
    openPlaylist,
    openPianoRoll,
    selectPattern,
    createPattern,
    renamePattern,
    deletePattern,
    updatePatternNotes,
    addToArrangement,
    moveInArrangement,
    removeFromArrangement,
  } = workspace;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleSave = async () => {
    try {
      await save();
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="brandBlock">
          <span className="eyebrow">WEBMUZIC / STUDIO</span>
          <h1>Song workspace</h1>
        </div>
        <div className="viewSwitcher" aria-label="Workspace view">
          <button className={!isPianoRollOpen ? "active" : ""} type="button" onClick={openPlaylist}>Playlist</button>
          <button className={isPianoRollOpen ? "active" : ""} type="button" onClick={openPianoRoll}>Piano roll</button>
        </div>
        <div className="studioControls">
          <div className="transportControls topTransport" aria-label="Playback controls">
            <button className="transportButton primary" type="button" onClick={startPlayback} disabled={isPlaybackActive}>Start</button>
            <button className="transportButton" type="button" onClick={pausePlayback} disabled={!isPlaybackActive}>Pause</button>
            <button className="transportButton" type="button" onClick={stopPlayback}>Stop</button>
          </div>
          <label className="patternSelectControl">
            <span>Pattern</span>
            <select value={selectedPatternId} onChange={(event) => selectPattern(event.target.value)}>
              {patterns.map((pattern) => <option value={pattern.id} key={pattern.id}>{pattern.name}</option>)}
            </select>
          </label>
          <label className="bpmSelectControl">
            <span>BPM</span>
            <input type="number" min="40" max="240" value={bpm} onChange={(event) => handleBpmChange(Number(event.target.value))} />
          </label>
        </div>
        <div className="accountControls">
          <button className="saveButton" type="button" onClick={handleSave} disabled={isSaving || isProjectLoading}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          {isSessionLoading ? null : user ? (
            <details className="accountMenu">
              <summary className="userName">{user.username}<span aria-hidden="true">⌄</span></summary>
              <div className="accountMenuPanel">
                <a className="accountButton" href={backendUrl}>Saglabātie projekti</a>
                <button className="accountButton" type="button" onClick={handleLogout}>Iziet</button>
              </div>
            </details>
          ) : (
            <a className="accountButton" href="/login?return_to=studio">Pieslēgties</a>
          )}
        </div>
      </header>

      <div className="workspaceLayout">
        <PatternPlaylist
          patterns={patterns}
          selectedPatternId={selectedPatternId}
          isEditorOpen={isPianoRollOpen}
          onSelect={handlePatternClick}
          onCreate={createPattern}
          onRename={renamePattern}
          onDelete={deletePattern}
        />
        {isPianoRollOpen ? (
          <PianoRollEditor
            key={selectedPattern.id}
            notes={selectedPattern.notes}
            onNotesChange={(notes) => updatePatternNotes(selectedPattern.id, notes)}
            playback={pianoRollPlayback}
          />
        ) : (
          <ArrangementTimeline
            patterns={patterns}
            arrangement={arrangement}
            selectedPatternId={selectedPatternId}
            position={arrangementPlayback.position}
            isPlaying={arrangementPlayback.isPlaying}
            onSelectPattern={selectPattern}
            onAdd={addToArrangement}
            onMove={moveInArrangement}
            onRemove={removeFromArrangement}
            onPlay={arrangementPlayback.start}
            onStop={arrangementPlayback.stop}
            onSeek={arrangementPlayback.seek}
          />
        )}
      </div>
    </div>
  );
}
