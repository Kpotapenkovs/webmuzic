import { useState } from "react";
import "./PatternPlaylist.css";

export default function PatternPlaylist({ patterns, selectedPatternId, isEditorOpen, onSelect, onCreate, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  return (
    <aside className="patternPlaylist" aria-label="Pattern playlist">
      <div className="playlistHeader">
        <div>
          <span className="playlistKicker">ARRANGEMENT</span>
          <h2>Patterns</h2>
        </div>
        <button className="addPatternButton" type="button" onClick={onCreate} aria-label="Create pattern">+</button>
      </div>
      <div className="patternList">
        {patterns.map((pattern, index) => (
          <div className={`patternItem ${pattern.id === selectedPatternId ? "selected" : ""}`} onContextMenu={(event) => { event.preventDefault(); onDelete(pattern.id); }} key={pattern.id}>
            <button className="patternSelect" type="button" aria-expanded={pattern.id === selectedPatternId ? isEditorOpen : false} onClick={() => onSelect(pattern.id)}>
              <span className="patternIndex">{String(index + 1).padStart(2, "0")}</span>
              {editingId === pattern.id ? (
                <input autoFocus defaultValue={pattern.name} onBlur={(event) => { onRename(pattern.id, event.target.value); setEditingId(null); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
              ) : <span className="patternName">{pattern.name}</span>}
              <span className="noteCount">{pattern.notes.length}</span>
            </button>
            <div className="patternActions">
              <button type="button" onClick={() => setEditingId(pattern.id)} aria-label={`Rename ${pattern.name}`}>Edit</button>
              <button type="button" onClick={() => onDelete(pattern.id)} aria-label={`Delete ${pattern.name}`} disabled={patterns.length === 1}>×</button>
            </div>
          </div>
        ))}
      </div>
      <p className="storageStatus">Saved locally</p>
    </aside>
  );
}