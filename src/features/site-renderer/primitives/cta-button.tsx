"use client";

import type { BusinessInfo } from "@/domain/business";
import type { Cta } from "@/domain/cta";
import { resolveCta } from "@/lib/cta";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { MessageCircle, ArrowRight, Phone, Mail } from "lucide-react";
import { useSite } from "../site-context";

const ICONS = { whatsapp: MessageCircle, phone: Phone, email: Mail, section: ArrowRight, link: ArrowRight } as const;

/**
 * Botão de chamada. Resolve a ação (WhatsApp, seção, link, telefone, e-mail)
 * a partir dos dados do negócio. Se faltar informação, renderiza o botão
 * desativado com o motivo (nunca cria link com dados inventados).
 */
export function CtaButton({
  cta,
  business,
  variant = "primary",
  size = "md",
  className,
}: {
  cta: Cta;
  business: BusinessInfo;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
}) {
  const { mode } = useSite();
  const [demoNote, setDemoNote] = useState(false);
  const resolved = resolveCta(cta, business);
  if (resolved.status === "hidden") return null;
  const Icon = ICONS[cta.action];
  const classes = cn(
    "site-button group",
    variant === "primary" && "site-button-primary",
    variant === "outline" && "site-button-outline",
    variant === "ghost" && "site-button-ghost",
    size === "lg" && "site-button-lg",
    className,
  );
  const content = (
    <>
      <span>{resolved.label}</span>
      <Icon className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
    </>
  );

  // Demonstrações usam empresas fictícias sem telefone: o botão mantém a aparência
  // e, ao clicar, explica o que faria num site real (nenhum número é inventado).
  if (resolved.status === "unavailable" && mode === "demo") {
    return (
      <span className="relative inline-flex">
        <button type="button" className={classes} onClick={() => setDemoNote((v) => !v)} aria-expanded={demoNote}>
          {content}
        </button>
        {demoNote && (
          <span role="status" className="absolute top-full left-0 z-20 mt-2 w-64 rounded-[var(--site-radius)] border border-site-border bg-site-surface p-3 text-xs leading-relaxed text-site-text shadow-xl">
            Demonstração: em um site real, este botão usa o contato configurado pelo negócio ({resolved.reason.toLowerCase()})
          </span>
        )}
      </span>
    );
  }

  if (resolved.status === "unavailable") {
    return (
      <span className={cn(classes, "cursor-not-allowed opacity-60")} title={resolved.reason} aria-disabled="true" data-cta-unavailable={resolved.reason}>
        {content}
      </span>
    );
  }
  return (
    <a
      href={resolved.href}
      className={classes}
      {...(resolved.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-cta-action={cta.action}
    >
      {content}
      {resolved.external && <span className="sr-only">(abre em nova aba)</span>}
    </a>
  );
}
