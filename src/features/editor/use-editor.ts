"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { Project } from "@/domain/project";
import { projectSchema } from "@/domain/project";
import { ApiError } from "@/lib/api-client";
import { projectsApi } from "@/features/projects/api";
import { createEditorState, editorReducer, snapshot } from "./editor-state";

export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string }
  | { kind: "conflict"; message: string };

/** Estado do editor + salvamento com detecção de conflito (revisão). */
export function useEditor(initial: Project) {
  const [state, dispatch] = useReducer(editorReducer, initial, createEditorState);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" });
  const dirty = useMemo(() => snapshot(state.project) !== state.savedSnapshot, [state.project, state.savedSnapshot]);

  const save = useCallback(
    async (options: { force?: boolean } = {}) => {
      const parsed = projectSchema.safeParse(state.project);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        setSaveStatus({ kind: "error", message: `Não foi possível salvar: ${issue?.message ?? "dados inválidos"} (${issue?.path.join(".")}).` });
        return false;
      }
      setSaveStatus({ kind: "saving" });
      try {
        let expected = state.project.revision;
        if (options.force) expected = (await projectsApi.get(state.project.id)).revision;
        const saved = await projectsApi.save(parsed.data, expected);
        dispatch({ type: "saved", project: saved });
        setSaveStatus({ kind: "saved", at: Date.now() });
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          setSaveStatus({ kind: "conflict", message: error.message });
        } else {
          setSaveStatus({ kind: "error", message: error instanceof Error ? error.message : "Falha ao salvar." });
        }
        return false;
      }
    },
    [state.project],
  );

  const reloadFromServer = useCallback(async () => {
    const fresh = await projectsApi.get(state.project.id);
    dispatch({ type: "loaded", project: fresh });
    setSaveStatus({ kind: "idle" });
  }, [state.project.id]);

  // Aviso ao fechar/recarregar a aba com alterações não salvas.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return { state, dispatch, dirty, save, saveStatus, setSaveStatus, reloadFromServer };
}
