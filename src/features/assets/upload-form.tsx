"use client";

import { useRef, useState, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { ASSET_KIND_LABELS, type AssetRecord, type UploadMetadata } from "@/domain/assets";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Notice } from "@/components/ui/misc";
import { ApiError } from "@/lib/api-client";
import { ACCEPT_ATTRIBUTE, checkUpload } from "./file-signature";
import { assetsApi } from "./api";

type UploadKind = UploadMetadata["kind"];
const KINDS: UploadKind[] = ["image", "logo", "texture", "video", "model"];

/**
 * Envio de recursos. O tipo do arquivo é conferido no navegador (para avisar
 * cedo) e de novo no servidor (que é quem decide).
 */
export function UploadForm({ defaultKind = "image", onUploaded }: { defaultKind?: UploadKind; onUploaded: (asset: AssetRecord) => void }) {
  const [kind, setKind] = useState<UploadKind>(defaultKind);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [license, setLicense] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(selected: File | null) {
    setError(null);
    setFile(null);
    if (!selected) return;
    const head = new Uint8Array(await selected.slice(0, 32).arrayBuffer());
    const check = checkUpload(kind, head, selected.size);
    if (!check.ok) {
      setError(check.reason);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(selected);
    if (!name) setName(selected.name.replace(/\.[^.]+$/, "").slice(0, 120));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("Escolha um arquivo.");
    if ((kind === "image" || kind === "logo") && !alt.trim()) return setError("Descreva a imagem (texto alternativo) para acessibilidade.");
    setBusy(true);
    setError(null);
    try {
      const asset = await assetsApi.upload(file, { kind, name: name || file.name, alt, license });
      onUploaded(asset);
      setFile(null);
      setName("");
      setAlt("");
      setLicense("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          {(a) => (
            <Select id={a.id} value={kind} onChange={(e) => setKind(e.target.value as UploadKind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {ASSET_KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Arquivo" hint={kind === "video" ? "MP4 ou WEBM, até 60 MB" : kind === "model" ? "GLB, até 25 MB" : "PNG, JPG, WEBP ou AVIF, até 10 MB. SVG não é aceito."}>
          {(a) => (
            <Input
              id={a.id}
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTRIBUTE[kind]}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
              className="pt-2 file:mr-3 file:rounded file:border-0 file:bg-ink-700 file:px-2 file:py-1 file:text-xs file:text-fg"
            />
          )}
        </Field>
        <Field label="Nome">
          {(a) => <Input id={a.id} value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Texto alternativo" optional={kind !== "image" && kind !== "logo"} hint="Descreva o conteúdo da imagem para leitores de tela.">
          {(a) => <Input id={a.id} value={alt} maxLength={240} onChange={(e) => setAlt(e.target.value)} />}
        </Field>
        <Field label="Licença / origem" optional className="sm:col-span-2" hint="Ex.: foto própria, banco de imagens X (licença Y). Use apenas arquivos que você tem direito de usar.">
          {(a) => <Input id={a.id} value={license} maxLength={300} onChange={(e) => setLicense(e.target.value)} />}
        </Field>
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
      <Button type="submit" variant="primary" disabled={busy || !file} icon={<Upload className="size-4" aria-hidden />}>
        {busy ? "Enviando…" : "Enviar arquivo"}
      </Button>
    </form>
  );
}
