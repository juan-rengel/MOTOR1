import "server-only";
import path from "node:path";
import { FileAssetStore } from "./asset-store";
import { FileProjectRepository } from "./file-project-repository";
import type { ProjectRepository } from "./project-repository";

/** Diretório de dados locais (projetos e uploads). Configurável por CWS_DATA_DIR. */
export function getDataDir(): string {
  // Dados de execução: não devem ser incluídos no pacote do servidor (turbopackIgnore).
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.CWS_DATA_DIR || ".data");
}

let repository: ProjectRepository | null = null;

/**
 * Seleciona o driver de armazenamento. Hoje: arquivos locais.
 * FASE 9: escolher o driver Firebase quando configurado por variáveis de ambiente.
 */
export function getProjectRepository(): ProjectRepository {
  repository ??= new FileProjectRepository(getDataDir());
  return repository;
}

let assetStore: FileAssetStore | null = null;

export function getAssetStore(): FileAssetStore {
  assetStore ??= new FileAssetStore(getDataDir());
  return assetStore;
}
