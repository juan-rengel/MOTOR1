"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@/domain/project";
import { fromFrameMessageSchema, type ToFrameMessage } from "./frame-protocol";

export type Viewport = "desktop" | "tablet" | "mobile";
export const VIEWPORTS: Record<Viewport, { width: number; label: string }> = {
  desktop: { width: 1440, label: "Computador (1440 px)" },
  tablet: { width: 834, label: "Tablet (834 px)" },
  mobile: { width: 390, label: "Celular (390 px)" },
};

/**
 * Pré-visualização responsiva: o site roda num iframe com a largura real do
 * dispositivo (media queries funcionam de verdade) e é reduzido em escala
 * para caber no espaço disponível.
 */
export function PreviewFrame({
  project,
  viewport,
  selectedSectionId,
  motionDisabled,
  scrollRequest,
  onSelectSection,
  onInvalid,
}: {
  project: Project;
  viewport: Viewport;
  selectedSectionId: string | null;
  motionDisabled: boolean;
  scrollRequest: { sectionId: string; nonce: number } | null;
  onSelectSection: (id: string) => void;
  onInvalid: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Contador de "prontos": se o iframe recarregar, ele avisa de novo e recebe o projeto outra vez.
  const [readyCount, setReadyCount] = useState(0);
  const ready = readyCount > 0;
  const [box, setBox] = useState({ width: 0, height: 0 });
  const callbacks = useRef({ onSelectSection, onInvalid });
  useLayoutEffect(() => {
    callbacks.current = { onSelectSection, onInvalid };
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      const parsed = fromFrameMessageSchema.safeParse(event.data);
      if (!parsed.success) return;
      if (parsed.data.type === "cws:ready") setReadyCount((n) => n + 1);
      if (parsed.data.type === "cws:select") callbacks.current.onSelectSection(parsed.data.sectionId);
      if (parsed.data.type === "cws:invalid") callbacks.current.onInvalid(parsed.data.message);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Envia o projeto no próximo quadro (agrupa várias alterações rápidas).
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => {
      const message: ToFrameMessage = { type: "cws:render", project, selectedSectionId, motionDisabled };
      iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
    });
    return () => cancelAnimationFrame(id);
  }, [ready, readyCount, project, selectedSectionId, motionDisabled]);

  useEffect(() => {
    if (!ready || !scrollRequest) return;
    const message: ToFrameMessage = { type: "cws:scroll-to", sectionId: scrollRequest.sectionId };
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, [ready, scrollRequest]);

  const targetWidth = VIEWPORTS[viewport].width;
  const scale = box.width > 0 ? Math.min(1, (box.width - 32) / targetWidth) : 1;
  const frameHeight = box.height > 0 ? (box.height - 32) / scale : 800;

  return (
    <div ref={containerRef} className="relative size-full overflow-hidden">
      {/* Largura real do dispositivo; a escala só reduz visualmente (o layout do site não é afetado). */}
      <div
        className="absolute top-4 left-1/2 overflow-hidden rounded-lg border border-line-strong bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        style={{ width: targetWidth, height: frameHeight, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}
        data-viewport={viewport}
      >
        <iframe
          ref={iframeRef}
          src="/frame"
          title="Pré-visualização do site"
          className="size-full"
        />
      </div>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted" role="status">
          Preparando pré-visualização…
        </div>
      )}
    </div>
  );
}
