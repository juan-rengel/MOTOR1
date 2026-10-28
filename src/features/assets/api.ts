import type { AssetRecord, UploadMetadata } from "@/domain/assets";
import { apiFetch } from "@/lib/api-client";

export const assetsApi = {
  list: () => apiFetch<{ assets: AssetRecord[] }>("/api/assets").then((r) => r.assets),
  upload: (file: File, meta: UploadMetadata) => {
    const form = new FormData();
    form.set("file", file);
    form.set("kind", meta.kind);
    form.set("name", meta.name);
    form.set("alt", meta.alt);
    form.set("license", meta.license);
    return apiFetch<{ asset: AssetRecord }>("/api/assets", { method: "POST", body: form }).then((r) => r.asset);
  },
  remove: (id: string) => apiFetch<void>(`/api/assets/${id}`, { method: "DELETE" }),
};
