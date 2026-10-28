import type { Project, ProjectSummary } from "@/domain/project";

/**
 * Contrato de persistência de projetos.
 * A interface não conhece o mecanismo de armazenamento: hoje existe a
 * implementação em arquivos locais; um driver Firebase/Firestore poderá ser
 * adicionado sem alterar rotas ou componentes.
 */
export interface ProjectRepository {
  readonly driver: StorageDriverInfo;
  list(ownerId: string): Promise<ProjectSummary[]>;
  get(ownerId: string, id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  /** Grava se `expectedRevision` corresponder à revisão armazenada; senão lança conflito. */
  update(ownerId: string, project: Project, expectedRevision: number): Promise<Project>;
  delete(ownerId: string, id: string): Promise<boolean>;
}

export interface StorageDriverInfo {
  id: "local-files" | "memory";
  label: string;
  /** Descrição honesta de onde os dados ficam. */
  scope: string;
}
