"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/domain/project";
import { fromFrameMessageSchema, toFrameMessageSchema, type FromFrameMessage } from "@/features/editor/frame-protocol";
import { SiteRenderer } from "@/features/site-renderer/site-renderer";

function post(message: FromFrameMessage) {
  fromFrameMessageSchema.parse(message);
  window.parent.postMessage(message, window.location.origin);
}

/**
 * Pré-visualização dentro do editor. Recebe o projeto por postMessage apenas
 * da própria origem e do iframe pai; projetos inválidos são ignorados.
 */
export function FrameClient() {
  const [state, setState] = useState<{ project: Project; selected: string | null; motionDisabled: boolean } | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const parsed = toFrameMessageSchema.safeParse(event.data);
      if (!parsed.success) {
        if ((event.data as { type?: string })?.type === "cws:render") post({ type: "cws:invalid", message: parsed.error.issues[0]?.message ?? "Projeto inválido." });
        return;
      }
      const msg = parsed.data;
      if (msg.type === "cws:render") {
        setState({ project: msg.project, selected: msg.selectedSectionId, motionDisabled: msg.motionDisabled });
      } else if (msg.type === "cws:scroll-to") {
        document.querySelector(`[data-section-id="${CSS.escape(msg.sectionId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("message", onMessage);
    if (window.parent !== window) post({ type: "cws:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06080a] text-sm text-white/60" role="status">
        Carregando pré-visualização…
      </div>
    );
  }
  return (
    <SiteRenderer
      key={state.motionDisabled ? "static" : "motion"}
      project={state.project}
      mode="editor"
      selectedSectionId={state.selected}
      motionDisabled={state.motionDisabled}
      onSelectSection={(id) => post({ type: "cws:select", sectionId: id })}
    />
  );
}
