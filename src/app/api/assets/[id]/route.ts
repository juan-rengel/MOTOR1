import { getCurrentOwner } from "@/server/auth/current-owner";
import { rejectCrossOrigin } from "@/server/http/request-guards";
import { handleRouteError, jsonError } from "@/server/http/responses";
import { getAssetStore } from "@/server/storage";

export async function DELETE(request: Request, ctx: RouteContext<"/api/assets/[id]">) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  try {
    const { id } = await ctx.params;
    const owner = await getCurrentOwner();
    const deleted = await getAssetStore().delete(owner.id, id);
    if (!deleted) return jsonError(404, "not_found", "Recurso não encontrado.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
