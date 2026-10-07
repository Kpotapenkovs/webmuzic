import PianoRollEditor from "./components/PianoRollEditor";
import PatternPlaylist from "./components/PatternPlaylist";
import ArrangementTimeline from "./components/ArrangementTimeline";
import useStudioWorkspace from "./hooks/useStudioWorkspace";
import useSessionUser from "./hooks/useSessionUser";
import useProjectPersistence from "./hooks/useProjectPersistence";
import useStudioProjectActions from "./hooks/useStudioProjectActions";
import { MAX_BPM, MIN_BPM } from "./config/studio";
import "./App.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export default function App() {
  const workspace = useStudioWorkspace();
  const { isLoading: isSessionLoading, user, logout } = useSessionUser();
  const { project, isLoading: isProjectLoading, isSaving, save } = useProjectPersistence(workspace);
  const isReadOnly = new URLSearchParams(window.location.search).get("readonly") === "1";
  const isWorkspaceLocked = isReadOnly || isProjectLoading;
  const { handleSave, exportProject, importProject } = useStudioProjectActions({ workspace, project, isReadOnly, save });
  const {
    isPianoRollOpen,
    bpm,
    volume,
    setVolume,
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
    extendPattern,
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

  return (
    <div className={`appShell ${isReadOnly ? "readOnly" : ""}`}>
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
            <button className="transportButton primary" type="button" onClick={startPlayback} disabled={isProjectLoading || isPlaybackActive}>Start</button>
            <button className="transportButton" type="button" onClick={pausePlayback} disabled={!isPlaybackActive}>Pause</button>
            <button className="transportButton" type="button" onClick={stopPlayback}>Stop</button>
          </div>
          <label className="patternSelectControl">
            <span>Pattern</span>
            <select value={selectedPatternId} onChange={(event) => selectPattern(event.target.value)} disabled={isProjectLoading}>
              {patterns.map((pattern) => <option value={pattern.id} key={pattern.id}>{pattern.name}</option>)}
            </select>
          </label>
          <label className="bpmSelectControl">
            <span>BPM</span>
            <input type="number" min={MIN_BPM} max={MAX_BPM} step="1" value={bpm} onChange={(event) => handleBpmChange(Number(event.target.value))} disabled={isWorkspaceLocked} />
          </label>
        </div>
        <div className="accountControls">
          {!isReadOnly && <button className="accountButton" type="button" onClick={exportProject} disabled={isProjectLoading}>Eksportēt JSON</button>}
          {!isReadOnly && <label className={`accountButton ${isProjectLoading ? "disabled" : ""}`}>Importēt JSON<input hidden type="file" accept="application/json,.json" onChange={importProject} disabled={isProjectLoading} /></label>}
          {!isReadOnly && <button className="saveButton" type="button" onClick={handleSave} disabled={isSaving || isProjectLoading}>
            {isSaving ? "Saving..." : "Save"}
          </button>}
          {isSessionLoading ? null : user ? (
            <details className="accountMenu">
              <summary className="userName">{user.username}<span aria-hidden="true">⌄</span></summary>
              <div className="accountMenuPanel">
                <a className="accountButton" href={backendUrl}>Saglabātie projekti</a>
                <a className="accountButton" href={`${backendUrl}/publications`}>Publikācijas</a>
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
          onCreate={isWorkspaceLocked ? () => {} : createPattern}
          onRename={isWorkspaceLocked ? () => {} : renamePattern}
          onDelete={isWorkspaceLocked ? () => {} : deletePattern}
          onExtend={isWorkspaceLocked ? () => {} : extendPattern}
          readOnly={isWorkspaceLocked}
        />
        {isPianoRollOpen ? (
          <PianoRollEditor
            key={selectedPattern.id}
            notes={selectedPattern.notes}
            onNotesChange={(notes) => !isWorkspaceLocked && updatePatternNotes(selectedPattern.id, notes)}
            playback={pianoRollPlayback}
            readOnly={isWorkspaceLocked}
            volume={volume}
            onVolumeChange={setVolume}
          />
        ) : (
          <ArrangementTimeline
            patterns={patterns}
            arrangement={arrangement}
            selectedPatternId={selectedPatternId}
            position={arrangementPlayback.position}
            isPlaying={arrangementPlayback.isPlaying}
            onSelectPattern={selectPattern}
            onAdd={isWorkspaceLocked ? () => {} : addToArrangement}
            onMove={isWorkspaceLocked ? () => {} : moveInArrangement}
            onRemove={isWorkspaceLocked ? () => {} : removeFromArrangement}
            onPlay={arrangementPlayback.start}
            onStop={arrangementPlayback.stop}
            onSeek={arrangementPlayback.seek}
            readOnly={isWorkspaceLocked}
          />
        )}
      </div>
    </div>
  );
}
