"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmação baseado em <dialog> nativo: foco preso no diálogo,
 * Esc fecha, e o restante da página fica inerte enquanto aberto.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,440px)] rounded-xl border border-line-strong bg-ink-850 p-0 text-fg shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="p-6">
          <h2 id="confirm-title" className="font-display text-lg font-semibold">
            {title}
          </h2>
          {description && <div className="mt-2 text-sm text-fg-muted">{description}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={busy} autoFocus>
              {cancelLabel}
            </Button>
            <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
              {busy ? "Aguarde…" : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
