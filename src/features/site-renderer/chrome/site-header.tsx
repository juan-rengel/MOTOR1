"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Cta } from "@/domain/cta";
import { buildWhatsAppLink } from "@/lib/phone";
import { CtaButton } from "../primitives/cta-button";
import { useSite } from "../site-context";

export function SiteHeader() {
  const { project } = useSite();
  const { business, brand, sections } = project;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);

  const navItems = sections.filter((s) => !s.hidden && s.navLabel.trim());
  const contact = sections.find((s) => s.type === "contact" && !s.hidden);
  const headerCta: Cta = buildWhatsAppLink(business.whatsapp)
    ? { label: "Fale conosco", action: "whatsapp", target: `Olá, ${business.name}! Vim pelo site.` }
    : { label: contact ? "Contato" : "", action: "section", target: contact?.anchor ?? "" };

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 320 && y > lastY.current + 4);
        if (y < lastY.current - 4 || y < 320) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled && !open ? "border-b border-site-border/60 bg-site-bg/80 backdrop-blur-xl" : "border-b border-transparent",
        hidden && !open && "-translate-y-full",
      )}
    >
      <div className="site-container flex h-[4.5rem] items-center justify-between gap-6">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={`${business.name} — início`}>
          {brand.logo.src && (
            // eslint-disable-next-line @next/next/no-img-element -- logotipo definido pelo usuário
            <img src={brand.logo.src} alt={brand.logo.alt || business.name} className="h-9 w-auto max-w-[140px] object-contain" />
          )}
          {(!brand.logo.src || brand.showNameWithLogo) && (
            <span className="site-heading truncate text-lg md:text-xl">{business.name}</span>
          )}
        </a>
        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {navItems.map((s) => (
              <li key={s.id}>
                <a href={`#${s.anchor}`} className="group relative py-2 text-site-text/80 transition-colors hover:text-site-text">
                  {s.navLabel}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-site-primary transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <CtaButton cta={headerCta} business={business} className="min-h-10 px-4 py-2 text-sm" />
          </div>
          {navItems.length > 0 && (
            <button
              ref={menuButton}
              type="button"
              className="flex size-11 items-center justify-center rounded-full border border-site-border text-site-text lg:hidden"
              aria-expanded={open}
              aria-controls="site-mobile-menu"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          )}
        </div>
      </div>
      <div
        id="site-mobile-menu"
        className={cn(
          "fixed inset-x-0 top-[4.5rem] bottom-0 bg-site-bg/97 backdrop-blur-xl transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        hidden={!open}
      >
        <nav aria-label="Menu" className="site-container flex h-full flex-col justify-between pt-8 pb-10">
          <ul className="space-y-1">
            {navItems.map((s, i) => (
              <li
                key={s.id}
                className={cn("transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              >
                <a href={`#${s.anchor}`} onClick={() => setOpen(false)} className="site-heading block py-3 text-4xl">
                  {s.navLabel}
                </a>
              </li>
            ))}
          </ul>
          <CtaButton cta={headerCta} business={business} size="lg" className="w-full" />
        </nav>
      </div>
    </header>
  );
}
