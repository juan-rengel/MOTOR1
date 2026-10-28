import { uploadMetadataSchema } from "@/domain/assets";
import { DEMO_ASSETS } from "@/features/assets/demo-assets";
import { getCurrentOwner } from "@/server/auth/current-owner";
import { rejectCrossOrigin } from "@/server/http/request-guards";
import { handleRouteError, jsonError, zodIssues } from "@/server/http/responses";
import { getAssetStore } from "@/server/storage";

const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;

export async function GET() {
  try {
    const owner = await getCurrentOwner();
    const uploads = await getAssetStore().list(owner.id);
    return Response.json({ assets: [...uploads, ...DEMO_ASSETS] });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Upload de recurso (multipart/form-data): campos file, kind, name, alt, license. */
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError(413, "too_large", "Arquivo muito grande.");
    if (!(request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      return jsonError(415, "unsupported", "Envie o arquivo como multipart/form-data.");
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError(422, "validation", "Nenhum arquivo enviado.");
    if (file.size > MAX_UPLOAD_BYTES) return jsonError(413, "too_large", "Arquivo muito grande.");
    const meta = uploadMetadataSchema.safeParse({
      kind: form.get("kind"),
      name: form.get("name") || file.name.replace(/\.[^.]+$/, ""),
      alt: form.get("alt") ?? "",
      license: form.get("license") ?? "",
    });
    if (!meta.success) return jsonError(422, "validation", "Dados do recurso inválidos.", zodIssues(meta.error));
    const owner = await getCurrentOwner();
    const record = await getAssetStore().save(owner.id, meta.data, new Uint8Array(await file.arrayBuffer()));
    return Response.json({ asset: record }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
