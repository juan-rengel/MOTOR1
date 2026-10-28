import type { BusinessInfo } from "@/domain/business";
import type { MotionSettings } from "@/domain/motion";
import type { Project } from "@/domain/project";
import type { SceneSettings } from "@/domain/scene";
import type { Section, SectionType } from "@/domain/sections";
import type { SiteTheme } from "@/domain/theme";
import { createSection, uniqueAnchor } from "@/features/sections/create-section";
import { shortId } from "@/lib/ids";

/**
 * Estado do editor: projeto em edição, histórico (desfazer/refazer) e seleção.
 * Toda alteração passa por este reducer — nada manipula o DOM diretamente.
 */
export interface EditorState {
  project: Project;
  /** Instantâneo serializado da última versão salva (para detectar alterações). */
  savedSnapshot: string;
  past: Project[];
  future: Project[];
  selectedSectionId: string | null;
  /** Agrupa digitação contínua no mesmo campo em um único passo de desfazer. */
  lastEdit: { key: string; at: number } | null;
}

export type EditorAction =
  | { type: "loaded"; project: Project }
  | { type: "saved"; project: Project }
  | { type: "select"; sectionId: string | null }
  | { type: "undo" }
  | { type: "redo" }
  /** key: agrupa edições consecutivas com a mesma chave; null = passo próprio de desfazer. */
  | { type: "edit"; key: string | null; apply: (project: Project) => Project; now?: number }
  | { type: "addSection"; sectionType: SectionType; afterId?: string | null }
  | { type: "removeSection"; sectionId: string }
  | { type: "moveSection"; sectionId: string; delta: -1 | 1 }
  | { type: "duplicateSection"; sectionId: string };

const HISTORY_LIMIT = 60;
const COALESCE_MS = 900;

export function snapshot(project: Project): string {
  // revision/updatedAt mudam ao salvar e não representam edição do usuário.
  return JSON.stringify({ ...project, revision: 0, updatedAt: "" });
}

export function createEditorState(project: Project): EditorState {
  return {
    project,
    savedSnapshot: snapshot(project),
    past: [],
    future: [],
    selectedSectionId: project.sections[0]?.id ?? null,
    lastEdit: null,
  };
}

function commit(state: EditorState, next: Project, editKey: string | null, now = Date.now()): EditorState {
  if (next === state.project) return state;
  const coalesce = editKey !== null && state.lastEdit?.key === editKey && now - state.lastEdit.at < COALESCE_MS;
  return {
    ...state,
    project: next,
    past: coalesce ? state.past : [...state.past, state.project].slice(-HISTORY_LIMIT),
    future: [],
    lastEdit: editKey ? { key: editKey, at: now } : null,
  };
}

function withSections(project: Project, sections: Section[]): Project {
  return { ...project, sections };
}

/** Clona uma seção com novos ids (inclusive dos itens de listas). */
function cloneSection(section: Section, takenAnchors: string[]): Section {
  const copy = structuredClone(section) as Section;
  copy.id = shortId();
  copy.anchor = uniqueAnchor(section.anchor, takenAnchors);
  const props = copy.props as Record<string, unknown>;
  for (const value of Object.values(props)) {
    if (Array.isArray(value)) {
      for (const item of value) if (item && typeof item === "object" && "id" in item) (item as { id: string }).id = shortId();
    }
  }
  return copy;
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const { project } = state;
  switch (action.type) {
    case "loaded":
      return createEditorState(action.project);
    case "saved":
      // Mantém edições feitas durante o salvamento; atualiza apenas metadados de revisão.
      return {
        ...state,
        project: { ...state.project, revision: action.project.revision, updatedAt: action.project.updatedAt },
        savedSnapshot: snapshot(action.project),
      };
    case "select":
      return { ...state, selectedSectionId: action.sectionId };
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        project: { ...previous, revision: project.revision, updatedAt: project.updatedAt },
        past: state.past.slice(0, -1),
        future: [project, ...state.future],
        lastEdit: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        project: { ...next, revision: project.revision, updatedAt: project.updatedAt },
        past: [...state.past, project],
        future: state.future.slice(1),
        lastEdit: null,
      };
    }
    case "edit":
      return commit(state, action.apply(project), action.key, action.now);
    case "addSection": {
      const section = createSection(action.sectionType);
      section.anchor = uniqueAnchor(section.anchor, project.sections.map((s) => s.anchor));
      const index = action.afterId ? project.sections.findIndex((s) => s.id === action.afterId) + 1 : project.sections.length;
      const sections = [...project.sections];
      sections.splice(index <= 0 ? sections.length : index, 0, section);
      return { ...commit(state, withSections(project, sections), null), selectedSectionId: section.id };
    }
    case "removeSection": {
      const index = project.sections.findIndex((s) => s.id === action.sectionId);
      if (index < 0) return state;
      const sections = project.sections.filter((s) => s.id !== action.sectionId);
      const nextSelected = sections[Math.min(index, sections.length - 1)]?.id ?? null;
      return { ...commit(state, withSections(project, sections), null), selectedSectionId: nextSelected };
    }
    case "moveSection": {
      const index = project.sections.findIndex((s) => s.id === action.sectionId);
      const target = index + action.delta;
      if (index < 0 || target < 0 || target >= project.sections.length) return state;
      const sections = [...project.sections];
      const [moved] = sections.splice(index, 1);
      sections.splice(target, 0, moved!);
      return commit(state, withSections(project, sections), null);
    }
    case "duplicateSection": {
      const index = project.sections.findIndex((s) => s.id === action.sectionId);
      const original = project.sections[index];
      if (!original) return state;
      const copy = cloneSection(original, project.sections.map((s) => s.anchor));
      const sections = [...project.sections];
      sections.splice(index + 1, 0, copy);
      return { ...commit(state, withSections(project, sections), null), selectedSectionId: copy.id };
    }
  }
}

/* ---------- Atualizadores imutáveis reutilizados pelos painéis ---------- */

export const updateBusiness = (patch: Partial<BusinessInfo>) => (p: Project): Project => ({ ...p, business: { ...p.business, ...patch } });
export const updateTheme = (patch: Partial<SiteTheme>) => (p: Project): Project => ({ ...p, theme: { ...p.theme, ...patch } });
export const updateMotion = (patch: Partial<MotionSettings>) => (p: Project): Project => ({ ...p, motion: { ...p.motion, ...patch } });
export const updateScene = (patch: Partial<SceneSettings>) => (p: Project): Project => ({ ...p, scene: { ...p.scene, ...patch } });

/** Define um valor dentro das props de uma seção usando um caminho (ex.: ["items", 2, "title"]). */
export function setSectionValue(sectionId: string, path: Array<string | number>, value: unknown) {
  return (p: Project): Project => ({
    ...p,
    sections: p.sections.map((s) => (s.id === sectionId ? ({ ...s, props: setIn(s.props, path, value) } as Section) : s)),
  });
}

export function updateSectionMeta(sectionId: string, patch: Partial<Pick<Section, "anchor" | "navLabel" | "hidden">>) {
  return (p: Project): Project => ({
    ...p,
    sections: p.sections.map((s) => (s.id === sectionId ? ({ ...s, ...patch } as Section) : s)),
  });
}

export function setIn<T>(target: T, path: Array<string | number>, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(target)) {
    const copy = [...target];
    copy[head as number] = setIn(copy[head as number], rest, value);
    return copy as T;
  }
  const obj = (target ?? {}) as Record<string, unknown>;
  return { ...obj, [head as string]: setIn(obj[head as string], rest, value) } as T;
}

export function getIn(target: unknown, path: Array<string | number>): unknown {
  return path.reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]), target);
}
