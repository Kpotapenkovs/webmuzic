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
      workspace.loadProject(data.data ?? data, true);
    } catch {
      window.alert("JSON projekta failu neizdevās nolasīt.");
    }

    event.target.value = "";
  };

  return { handleSave, exportProject, importProject };
}
