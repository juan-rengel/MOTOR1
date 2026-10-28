import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { conflict, notFound } from "@/domain/errors";
import { UUID_PATTERN } from "@/domain/primitives";
import { projectSchema, toProjectSummary, type Project, type ProjectSummary } from "@/domain/project";
import { migrateProject } from "@/domain/migrations";
import { KeyedMutex, readFileIfExists, writeFileAtomic } from "./fs-utils";
import type { ProjectRepository } from "./project-repository";

/**
 * Persistência em arquivos JSON locais: <dataDir>/projects/<id>.json.
 * Os dados ficam APENAS nesta instalação (nesta pasta, neste computador).
 * Cada leitura e gravação é validada pelo schema do domínio.
 */
export class FileProjectRepository implements ProjectRepository {
  readonly driver = {
    id: "local-files" as const,
    label: "Arquivos locais",
    scope: "Dados gravados em arquivos JSON nesta instalação. Não há sincronização nem backup remoto.",
  };
  private readonly mutex = new KeyedMutex();
  private readonly projectsDir: string;

  constructor(dataDir: string) {
    this.projectsDir = path.join(dataDir, "projects");
  }

  private fileFor(id: string): string {
    if (!UUID_PATTERN.test(id)) throw notFound("Projeto não encontrado.");
    return path.join(this.projectsDir, `${id}.json`);
  }

  private async readProject(id: string): Promise<Project | null> {
    const raw = await readFileIfExists(this.fileFor(id));
    if (raw === null) return null;
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      console.warn(`[storage] Arquivo de projeto ilegível ignorado: ${id}`);
      return null;
    }
    const parsed = projectSchema.safeParse(migrateProject(json));
    if (!parsed.success) {
      console.warn(`[storage] Projeto com formato inválido ignorado: ${id}`);
      return null;
    }
    return parsed.data;
  }

  async list(ownerId: string): Promise<ProjectSummary[]> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.projectsDir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
    const ids = entries.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => UUID_PATTERN.test(id));
    const projects = await Promise.all(ids.map((id) => this.readProject(id)));
    return projects
      .filter((p): p is Project => p !== null && p.ownerId === ownerId)
      .map(toProjectSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(ownerId: string, id: string): Promise<Project | null> {
    if (!UUID_PATTERN.test(id)) return null;
    const project = await this.readProject(id);
    return project && project.ownerId === ownerId ? project : null;
  }

  async create(project: Project): Promise<Project> {
    const valid = projectSchema.parse(project);
    return this.mutex.run(valid.id, async () => {
      const file = this.fileFor(valid.id);
      if ((await readFileIfExists(file)) !== null) throw conflict("Já existe um projeto com este identificador.");
      await writeFileAtomic(file, JSON.stringify(valid, null, 2));
      return valid;
    });
  }

  async update(ownerId: string, project: Project, expectedRevision: number): Promise<Project> {
    return this.mutex.run(project.id, async () => {
      const current = await this.readProject(project.id);
      if (!current || current.ownerId !== ownerId) throw notFound("Projeto não encontrado.");
      if (current.revision !== expectedRevision) {
        throw conflict("O projeto foi alterado em outra aba ou janela. Recarregue para ver a versão mais recente.");
      }
      const next = projectSchema.parse({
        ...project,
        ownerId: current.ownerId,
        createdAt: current.createdAt,
        revision: current.revision + 1,
        updatedAt: new Date().toISOString(),
      });
      await writeFileAtomic(this.fileFor(project.id), JSON.stringify(next, null, 2));
      return next;
    });
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    if (!UUID_PATTERN.test(id)) return false;
    return this.mutex.run(id, async () => {
      const current = await this.readProject(id);
      if (!current || current.ownerId !== ownerId) return false;
      await fs.rm(this.fileFor(id), { force: true });
      return true;
    });
  }
}
