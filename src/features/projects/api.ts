import type { Project, ProjectSummary } from "@/domain/project";
import { apiFetch } from "@/lib/api-client";
import type { CreateProjectInput } from "@/features/templates/create-project";

export const projectsApi = {
  list: () => apiFetch<{ projects: ProjectSummary[] }>("/api/projects").then((r) => r.projects),
  get: (id: string) => apiFetch<{ project: Project }>(`/api/projects/${id}`).then((r) => r.project),
  create: (input: CreateProjectInput) =>
    apiFetch<{ project: Project }>("/api/projects", { method: "POST", json: input }).then((r) => r.project),
  save: (project: Project, expectedRevision: number) =>
    apiFetch<{ project: Project }>(`/api/projects/${project.id}`, {
      method: "PUT",
      json: { project, expectedRevision },
    }).then((r) => r.project),
  remove: (id: string) => apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" }),
};
