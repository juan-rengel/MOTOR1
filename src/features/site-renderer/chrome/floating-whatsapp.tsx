"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/phone";
import { cn } from "@/lib/cn";
import { useSite } from "../site-context";

/** Botão flutuante de WhatsApp. Só aparece com número válido e após a capa. */
export function FloatingWhatsApp() {
  const { project } = useSite();
  const [visible, setVisible] = useState(false);
  const href = buildWhatsAppLink(project.business.whatsapp, `Olá, ${project.business.name}! Vim pelo site.`);

  useEffect(() => {
    if (!href) return;
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [href]);

  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp (abre em nova aba)"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
