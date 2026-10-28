// @vitest-environment node
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { FileProjectRepository } from "@/server/storage/file-project-repository";
import { createTemplateDemo } from "@/features/templates/create-project";
import { TEMPLATES } from "@/features/templates/registry";
import { DomainError } from "@/domain/errors";

let dir: string;
let repo: FileProjectRepository;

function sample(id = crypto.randomUUID(), ownerId = "local") {
  return { ...createTemplateDemo(TEMPLATES[0]!), id, ownerId };
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "cws-repo-"));
  repo = new FileProjectRepository(dir);
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("FileProjectRepository", () => {
  it("lista vazio quando não há pasta", async () => {
    expect(await repo.list("local")).toEqual([]);
  });

  it("cria, lê e lista projetos do proprietário", async () => {
    const project = sample();
    await repo.create(project);
    expect(await repo.get("local", project.id)).toEqual(project);
    const list = await repo.list("local");
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(project.id);
  });

  it("isola projetos por proprietário", async () => {
    const project = sample(undefined, "alice");
    await repo.create(project);
    expect(await repo.get("bob", project.id)).toBeNull();
    expect(await repo.list("bob")).toEqual([]);
    expect(await repo.delete("bob", project.id)).toBe(false);
  });

  it("atualiza incrementando a revisão e detecta conflito", async () => {
    const project = sample();
    await repo.create(project);
    const edited = { ...project, business: { ...project.business, name: "Novo nome" } };
    const saved = await repo.update("local", edited, 0);
    expect(saved.revision).toBe(1);
    expect(saved.business.name).toBe("Novo nome");
    expect((await repo.get("local", project.id))?.business.name).toBe("Novo nome");

    await expect(repo.update("local", edited, 0)).rejects.toMatchObject({ code: "conflict" });
  });

  it("serializa gravações concorrentes sem perder revisões", async () => {
    const project = sample();
    await repo.create(project);
    const results = await Promise.allSettled([
      repo.update("local", project, 0),
      repo.update("local", project, 0),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });

  it("rejeita dados inválidos ao gravar", async () => {
    const project = sample();
    await repo.create(project);
    const invalid = { ...project, theme: { ...project.theme, colors: { ...project.theme.colors, primary: "red" } } };
    await expect(repo.update("local", invalid, 0)).rejects.toBeTruthy();
  });

  it("ignora arquivos corrompidos e ids inválidos", async () => {
    await mkdir(path.join(dir, "projects"), { recursive: true });
    await writeFile(path.join(dir, "projects", `${crypto.randomUUID()}.json`), "{não é json");
    await writeFile(path.join(dir, "projects", "../../escape.json"), "{}").catch(() => undefined);
    expect(await repo.list("local")).toEqual([]);
    expect(await repo.get("local", "../../etc/passwd")).toBeNull();
  });

  it("exclui projetos", async () => {
    const project = sample();
    await repo.create(project);
    expect(await repo.delete("local", project.id)).toBe(true);
    expect(await repo.get("local", project.id)).toBeNull();
  });

  it("não permite criar com id duplicado", async () => {
    const project = sample();
    await repo.create(project);
    await expect(repo.create(project)).rejects.toBeInstanceOf(DomainError);
  });
});
