import { getCurrentOwner } from "@/server/auth/current-owner";
import { handleRouteError, jsonError } from "@/server/http/responses";
import { getAssetStore } from "@/server/storage";

function parseRange(header: string | null): { start: number; end?: number } | undefined {
  const match = header ? /^bytes=(\d+)-(\d*)$/.exec(header) : null;
  if (!match?.[1]) return undefined;
  return { start: Number(match[1]), end: match[2] ? Number(match[2]) : undefined };
}

/**
 * Serve um arquivo enviado. Cabeçalhos de segurança: tipo fixo detectado no
 * upload, nosniff e CSP restritiva (o arquivo nunca é tratado como página).
 * Suporta Range para reprodução e avanço em vídeos.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/assets/[id]/file">) {
  try {
    const { id } = await ctx.params;
    const owner = await getCurrentOwner();
    const range = parseRange(request.headers.get("range"));
    const opened = await getAssetStore().open(owner.id, id, range);
    if (!opened) return jsonError(404, "not_found", "Arquivo não encontrado.");
    if (range && range.start >= opened.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${opened.size}` } });
    }
    const headers = new Headers({
      "Content-Type": opened.record.mimeType,
      "Content-Length": String(opened.end - opened.start + 1),
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": "inline",
    });
    if (range) headers.set("Content-Range", `bytes ${opened.start}-${opened.end}/${opened.size}`);
    return new Response(opened.stream, { status: range ? 206 : 200, headers });
  } catch (error) {
    return handleRouteError(error);
  }
}
