"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { BusinessInfo } from "@/domain/business";
import { buildWhatsAppLink } from "@/lib/phone";
import { cn } from "@/lib/cn";

type FormState =
  | { status: "idle" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "sending" }
  | { status: "sent"; channel: "whatsapp" | "email" | "demo"; href: string; opened: boolean };

const fieldClass =
  "w-full rounded-[var(--site-radius)] border border-site-border bg-site-bg px-4 py-3 text-site-text placeholder:text-site-muted/70 transition-colors focus:border-site-primary focus:outline-none aria-[invalid=true]:border-red-500";

/**
 * Formulário de contato SEM servidor: monta a mensagem e abre o WhatsApp
 * (ou o e-mail) do negócio para o próprio visitante confirmar o envio.
 * Nenhum dado é enviado automaticamente nem armazenado pela plataforma.
 */
export function ContactForm({ business, intro, demo = false }: { business: BusinessInfo; intro: string; demo?: boolean }) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const id = useId();
  // Em demonstrações (empresa fictícia, sem contato), o formulário funciona mas não abre nada.
  const channel: "whatsapp" | "email" | "demo" | null = buildWhatsAppLink(business.whatsapp)
    ? "whatsapp"
    : business.email.trim()
      ? "email"
      : demo
        ? "demo"
        : null;

  if (!channel) {
    return (
      <div className="site-card flex gap-3 p-6 text-sm text-site-muted" role="note">
        <AlertTriangle className="size-5 shrink-0 text-site-primary" aria-hidden />
        <p>Formulário indisponível: este site ainda não tem WhatsApp ou e-mail configurado para receber mensagens.</p>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channel) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = "Informe seu nome.";
    if (name.length > 80) errors.name = "Nome muito longo.";
    if (message.length < 5) errors.message = "Escreva sua mensagem (mínimo 5 caracteres).";
    if (message.length > 1000) errors.message = "Mensagem muito longa (máximo 1000 caracteres).";
    if (phone && !/^[0-9+()\-\s.]{8,20}$/.test(phone)) errors.phone = "Telefone inválido.";
    if (Object.keys(errors).length > 0) {
      setState({ status: "invalid", errors });
      return;
    }
    if (channel === "demo") {
      setState({ status: "sent", channel, href: "", opened: true });
      event.currentTarget.reset();
      return;
    }
    setState({ status: "sending" });
    const text = [`Olá, ${business.name}! Meu nome é ${name}.`, message, phone ? `Meu telefone: ${phone}` : ""].filter(Boolean).join("\n\n");
    const href =
      channel === "whatsapp"
        ? buildWhatsAppLink(business.whatsapp, text)!
        : `mailto:${business.email}?subject=${encodeURIComponent(`Contato pelo site — ${name}`)}&body=${encodeURIComponent(text)}`;
    let opened = true;
    if (channel === "whatsapp") {
      // window.open com "noopener" sempre retorna null; anulamos opener manualmente.
      const popup = window.open(href, "_blank");
      if (popup) popup.opener = null;
      opened = popup !== null;
    }
    if (channel === "email") window.location.href = href;
    setState({ status: "sent", channel, href, opened });
    event.currentTarget.reset();
  }

  const errors = state.status === "invalid" ? state.errors : {};

  if (state.status === "sent") {
    return (
      <div className="site-card p-8" role="status">
        <CheckCircle2 className="mb-4 size-8 text-site-primary" aria-hidden />
        <p className="site-heading text-2xl">Mensagem pronta!</p>
        <p className="mt-3 text-site-muted">
          {state.channel === "whatsapp"
            ? "Abrimos o WhatsApp com sua mensagem. Confirme o envio por lá."
            : state.channel === "email"
              ? "Abrimos seu aplicativo de e-mail com a mensagem. Confirme o envio por lá."
              : "Demonstração: em um site real, a mensagem seria aberta no WhatsApp ou e-mail do negócio para você confirmar. Nada foi enviado."}
        </p>
        {!state.opened && (
          <a href={state.href} target="_blank" rel="noopener noreferrer" className="site-button site-button-primary mt-6">
            Abrir WhatsApp
          </a>
        )}
        <button type="button" className="mt-6 block text-sm text-site-muted underline underline-offset-4" onClick={() => setState({ status: "idle" })}>
          Escrever outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="site-card space-y-5 p-6 md:p-8" aria-describedby={`${id}-intro`}>
      <p id={`${id}-intro`} className="text-sm text-site-muted">
        {intro}
      </p>
      {(
        [
          { name: "name", label: "Nome", type: "text", autoComplete: "name", required: true },
          { name: "phone", label: "Telefone (opcional)", type: "tel", autoComplete: "tel", required: false },
        ] as const
      ).map((f) => (
        <div key={f.name}>
          <label htmlFor={`${id}-${f.name}`} className="mb-2 block text-sm font-medium">
            {f.label}
          </label>
          <input
            id={`${id}-${f.name}`}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required={f.required}
            aria-invalid={Boolean(errors[f.name])}
            aria-describedby={errors[f.name] ? `${id}-${f.name}-error` : undefined}
            className={fieldClass}
          />
          {errors[f.name] && (
            <p id={`${id}-${f.name}-error`} className="mt-1.5 text-sm text-red-500">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor={`${id}-message`} className="mb-2 block text-sm font-medium">
          Mensagem
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          required
          maxLength={1000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
          className={cn(fieldClass, "resize-y")}
        />
        {errors.message && (
          <p id={`${id}-message-error`} className="mt-1.5 text-sm text-red-500">
            {errors.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={state.status === "sending"} className="site-button site-button-primary site-button-lg w-full">
        {state.status === "sending" ? "Preparando…" : channel === "email" ? "Enviar por e-mail" : "Enviar pelo WhatsApp"}
      </button>
    </form>
  );
}
