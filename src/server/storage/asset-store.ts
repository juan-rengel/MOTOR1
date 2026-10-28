import "server-only";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { assetRecordSchema, type AssetRecord, type UploadMetadata } from "@/domain/assets";
import { notFound, validationError } from "@/domain/errors";
import { checkUpload } from "@/features/assets/file-signature";
import { readFileIfExists, writeFileAtomic } from "./fs-utils";

const ID_PATTERN = /^[a-f0-9]{32}$/;

/**
 * Armazenamento local de uploads: <dataDir>/uploads/<id>.<ext> + <id>.json.
 * Os arquivos ficam fora de public/ e são servidos por uma rota que define
 * tipo, nosniff e sandbox — nunca executados.
 */
export class FileAssetStore {
  private readonly dir: string;

  constructor(dataDir: string) {
    this.dir = path.join(dataDir, "uploads");
  }

  private metaFile(id: string) {
    if (!ID_PATTERN.test(id)) throw notFound("Recurso não encontrado.");
    return path.join(this.dir, `${id}.json`);
  }

  async list(ownerId: string): Promise<AssetRecord[]> {
    let files: string[];
    try {
      files = await fs.readdir(this.dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
    const records = await Promise.all(
      files.filter((f) => f.endsWith(".json")).map((f) => this.get(ownerId, f.slice(0, -5)).catch(() => null)),
    );
    return records.filter((r): r is AssetRecord => r !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async get(ownerId: string, id: string): Promise<AssetRecord | null> {
    if (!ID_PATTERN.test(id)) return null;
    const raw = await readFileIfExists(this.metaFile(id));
    if (!raw) return null;
    const parsed = assetRecordSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.ownerId !== ownerId) return null;
    return parsed.data;
  }

  async save(ownerId: string, meta: UploadMetadata, bytes: Uint8Array): Promise<AssetRecord> {
    const check = checkUpload(meta.kind, bytes.subarray(0, 32), bytes.byteLength);
    if (!check.ok) throw validationError(check.reason);
    const id = crypto.randomUUID().replaceAll("-", "");
    const record: AssetRecord = assetRecordSchema.parse({
      id,
      ownerId,
      kind: meta.kind,
      name: meta.name,
      src: `/api/assets/${id}/file`,
      mimeType: check.type.mime,
      size: bytes.byteLength,
      alt: meta.alt,
      license: meta.license,
      source: "upload",
      createdAt: new Date().toISOString(),
    });
    await fs.mkdir(this.dir, { recursive: true });
    await writeFileAtomic(path.join(/*turbopackIgnore: true*/ this.dir, `${id}.${check.type.ext}`), bytes);
    await writeFileAtomic(this.metaFile(id), JSON.stringify(record, null, 2));
    return record;
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    const record = await this.get(ownerId, id);
    if (!record) return false;
    await fs.rm(path.join(/*turbopackIgnore: true*/ this.dir, `${id}.${extFromMime(record.mimeType)}`), { force: true });
    await fs.rm(this.metaFile(id), { force: true });
    return true;
  }

  /** Abre o arquivo para leitura, com suporte a intervalos (necessário para vídeo). */
  async open(ownerId: string, id: string, range?: { start: number; end?: number }) {
    const record = await this.get(ownerId, id);
    if (!record) return null;
    const file = path.join(/*turbopackIgnore: true*/ this.dir, `${id}.${extFromMime(record.mimeType)}`);
    const stat = await fs.stat(/*turbopackIgnore: true*/ file).catch(() => null);
    if (!stat) return null;
    const start = range?.start ?? 0;
    const end = Math.min(range?.end ?? stat.size - 1, stat.size - 1);
    const stream = Readable.toWeb(createReadStream(/*turbopackIgnore: true*/ file, { start, end })) as ReadableStream<Uint8Array>;
    return { record, stream, size: stat.size, start, end };
  }
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "model/gltf-binary": "glb",
  };
  return map[mime] ?? "bin";
}
