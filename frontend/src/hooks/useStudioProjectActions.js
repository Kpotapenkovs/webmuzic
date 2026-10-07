import { MAX_BPM, MAX_TIMELINE_BEATS, MIN_BPM } from "../config/studio";

const isValidProjectData = (projectData) => {
  if (!projectData || !Number.isInteger(projectData.bpm) || projectData.bpm < MIN_BPM || projectData.bpm > MAX_BPM) return false;
  if (!Array.isArray(projectData.patterns) || projectData.patterns.length === 0) return false;
  if (!Array.isArray(projectData.arrangement)) return false;

  const patternIds = new Set();
  for (const pattern of projectData.patterns) {
    if (!pattern || typeof pattern.id !== "string" || !pattern.id || patternIds.has(pattern.id)) return false;
    if (typeof pattern.name !== "string" || !Array.isArray(pattern.notes)) return false;
    if (pattern.length !== undefined && (!Number.isFinite(pattern.length) || pattern.length <= 0)) return false;
    patternIds.add(pattern.id);

    for (const note of pattern.notes) {
      if (!note || typeof note.id !== "string" || !Number.isInteger(note.row) || note.row < 0 || note.row >= 88) return false;
      if (!Number.isFinite(note.beat) || note.beat < 0 || note.beat >= MAX_TIMELINE_BEATS) return false;
      if (note.length !== undefined && (!Number.isFinite(note.length) || note.length <= 0 || note.beat + note.length > MAX_TIMELINE_BEATS)) return false;
    }
  }

  return projectData.arrangement.every((clip) => clip
    && typeof clip.id === "string"
    && patternIds.has(clip.patternId)
    && Number.isInteger(clip.startBeat)
    && clip.startBeat >= 0
    && clip.startBeat < MAX_TIMELINE_BEATS
    && (clip.track === undefined || (Number.isInteger(clip.track) && clip.track >= 0 && clip.track < 12)));
};

export default function useStudioProjectActions({ workspace, project, isReadOnly, save }) {
  const handleSave = async () => {
    if (isReadOnly) return;

    const title = project
      ? undefined
      : window.prompt("Ievadiet projekta nosaukumu", "Nenosaukts projekts");

    if (title === null) return;

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
    const data = {
      title: project?.title ?? "WebMuzic",
      bpm: workspace.bpm,
      patterns: workspace.patterns,
      selectedPatternId: workspace.selectedPatternId,
      arrangement: workspace.arrangement,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.title.replace(/[^a-z0-9_-]/gi, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      const projectData = data?.data ?? data;
      if (!isValidProjectData(projectData)) {
        throw new Error("Invalid project structure");
      }
      workspace.loadProject(projectData, true);
    } catch {
      window.alert("Failā nav derīgs WebMuzic projekta JSON.");
    }

    event.target.value = "";
  };

  return { handleSave, exportProject, importProject };
}
