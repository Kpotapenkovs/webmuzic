import { useCallback, useEffect, useState } from "react";
import { getCsrfToken } from "./useSessionUser";

const DEFAULT_PROJECT_TITLE = "Nenosaukts projekts";

export default function useProjectPersistence(workspace) {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get("project");

    if (!projectId) {
      return undefined;
    }

    let isCancelled = false;
    setIsLoading(true);

    fetch(`/projects/${projectId}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Projektu neizdevās ielādēt.");
        }

        return response.json();
      })
      .then(({ project: loadedProject }) => {
        if (isCancelled) {
          return;
        }

        workspace.loadProject(loadedProject.data);
        setProject(loadedProject);
      })
      .catch((error) => {
        if (!isCancelled) {
          window.alert(error.message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);

    try {
      const { token } = await getCsrfToken();
      const projectData = {
        bpm: workspace.bpm,
        patterns: workspace.patterns,
        selectedPatternId: workspace.selectedPatternId,
        arrangement: workspace.arrangement,
      };
      const response = await fetch(project ? `/projects/${project.id}` : "/projects", {
        method: project ? "PUT" : "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: JSON.stringify({
          title: project?.title ?? DEFAULT_PROJECT_TITLE,
          data: projectData,
        }),
      });

      if (!response.ok) {
        throw new Error("Projektu neizdevās saglabāt.");
      }

      const { project: savedProject } = await response.json();
      setProject(savedProject);
      workspace.markSaved();
      window.history.replaceState({}, "", `?project=${savedProject.id}`);
    } finally {
      setIsSaving(false);
    }
  }, [project, workspace]);

  return { isLoading, isSaving, save };
}
