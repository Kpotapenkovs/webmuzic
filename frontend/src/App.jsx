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
  const { project, isLoading: isProjectLoading, isSaving, save } = useProjectPersistence(workspace);
  const isReadOnly = new URLSearchParams(window.location.search).get("readonly") === "1";
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

  const handleSave = async () => {
    if (isReadOnly) return;
    const title = project
      ? undefined
      : window.prompt("Ievadiet projekta nosaukumu", "Nenosaukts projekts");

    if (title === null) {
      return;
    }

    if (title !== undefined && !title.trim()) {
      window.alert("Lūdzu, ievadiet projekta nosaukumu.");

      return;
    }

    try {
      await save(title?.trim());
    } catch (error) {
      window.alert(error.message);
    }
  };

  const exportProject = () => {
    const data = { title: project?.title ?? "WebMuzic", bpm: workspace.bpm, patterns: workspace.patterns, selectedPatternId: workspace.selectedPatternId, arrangement: workspace.arrangement };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `${data.title.replace(/[^a-z0-9_-]/gi, "-")}.json`; link.click(); URL.revokeObjectURL(url);
  };
  const importProject = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try { const data = JSON.parse(await file.text()); workspace.loadProject(data.data ?? data, true); }
    catch { window.alert("JSON projekta failu neizdevās nolasīt."); }
    event.target.value = "";
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
            <input type="number" min="40" max="240" value={bpm} onChange={(event) => handleBpmChange(Number(event.target.value))} disabled={isReadOnly} />
          </label>
        </div>
        <div className="accountControls">
          {!isReadOnly && <button className="accountButton" type="button" onClick={exportProject}>Eksportēt JSON</button>}
          {!isReadOnly && <label className="accountButton">Importēt JSON<input hidden type="file" accept="application/json,.json" onChange={importProject} /></label>}
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
          onCreate={isReadOnly ? () => {} : createPattern}
          onRename={isReadOnly ? () => {} : renamePattern}
          onDelete={isReadOnly ? () => {} : deletePattern}
          onExtend={isReadOnly ? () => {} : extendPattern}
          readOnly={isReadOnly}
        />
        {isPianoRollOpen ? (
          <PianoRollEditor
            key={selectedPattern.id}
            notes={selectedPattern.notes}
            onNotesChange={(notes) => !isReadOnly && updatePatternNotes(selectedPattern.id, notes)}
            playback={pianoRollPlayback}
            readOnly={isReadOnly}
          />
        ) : (
          <ArrangementTimeline
            patterns={patterns}
            arrangement={arrangement}
            selectedPatternId={selectedPatternId}
            position={arrangementPlayback.position}
            isPlaying={arrangementPlayback.isPlaying}
            onSelectPattern={selectPattern}
            onAdd={isReadOnly ? () => {} : addToArrangement}
            onMove={isReadOnly ? () => {} : moveInArrangement}
            onRemove={isReadOnly ? () => {} : removeFromArrangement}
            onPlay={arrangementPlayback.start}
            onStop={arrangementPlayback.stop}
            onSeek={arrangementPlayback.seek}
            readOnly={isReadOnly}
          />
        )}
      </div>
    </div>
  );
}
