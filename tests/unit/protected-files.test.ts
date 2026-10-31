import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import manifest from "../fixtures/protected-files.sha256.json";

/**
 * Integridade dos arquivos protegidos (modelos, recursos de demonstração, cenas 3D,
 * domínio, scripts, dependências e regras do projeto).
 *
 * Qualquer alteração, remoção ou arquivo novo dentro das pastas protegidas quebra este
 * teste. Atualizar `tests/fixtures/protected-files.sha256.json` só pode acontecer como
 * passo explícito de um plano aprovado — nunca para "fazer o teste passar".
 *
 * Arquivos de texto são comparados com quebras de linha normalizadas (CRLF → LF), para
 * o resultado ser o mesmo no Windows e no Linux.
 */

const ROOT = path.resolve(__dirname, "../..");
const BINARY = /\.(jpe?g|png|webp|avif|gif|glb|woff2?)$/i;

function hashFile(relative: string): string {
  const content = readFileSync(path.join(ROOT, relative));
  const data = BINARY.test(relative) ? content : Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
  return createHash("sha256").update(data).digest("hex");
}

function listFiles(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir)).flatMap((name) => {
    const relative = path.posix.join(dir, name);
    return statSync(path.join(ROOT, relative)).isDirectory() ? listFiles(relative) : [relative];
  });
}

const files = manifest.files as Record<string, string>;

describe("arquivos protegidos", () => {
  it.each(Object.keys(files))("%s não foi alterado", (relative) => {
    expect(hashFile(relative)).toBe(files[relative]);
  });

  it.each(manifest.closedDirectories)("a pasta %s não tem arquivos novos fora da lista", (dir) => {
    const unexpected = listFiles(dir).filter((f) => !(f in files));
    expect(unexpected).toEqual([]);
  });
});
