"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SectionOf } from "@/domain/sections";
import { buildTelLink, buildWhatsAppLink, formatPhoneForDisplay } from "@/lib/phone";
import { listSocialLinks } from "@/lib/social";
import { Reveal } from "@/features/animations/reveal";
import { CtaButton } from "../primitives/cta-button";
import { SectionHeading } from "../primitives/heading";
import { useSite } from "../site-context";
import { ContactForm } from "./contact-form";

export function ContactSection({ section }: { section: SectionOf<"contact"> }) {
  const { project, mode } = useSite();
  const { business } = project;
  const p = section.props;
  const tel = buildTelLink(business.phone);
  const hasWhatsApp = Boolean(buildWhatsAppLink(business.whatsapp));
  const social = listSocialLinks(business.social);

  return (
    <section className="site-section">
      <div className="site-container grid gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} className="mb-10 md:mb-12" />
          <Reveal as="ul" stagger className="space-y-5">
            {hasWhatsApp && (
              <li>
                <CtaButton cta={{ label: "Conversar no WhatsApp", action: "whatsapp", target: `Olá, ${business.name}! Vim pelo site.` }} business={business} size="lg" />
              </li>
            )}
            {tel && (
              <li className="flex items-center gap-4">
                <Phone className="size-5 text-site-primary" aria-hidden />
                <a href={tel} className="text-lg hover:text-site-primary">
                  {formatPhoneForDisplay(business.phone)}
                </a>
              </li>
            )}
            {business.email && (
              <li className="flex items-center gap-4">
                <Mail className="size-5 text-site-primary" aria-hidden />
                <a href={`mailto:${business.email}`} className="text-lg break-all hover:text-site-primary">
                  {business.email}
                </a>
              </li>
            )}
            {p.showAddress && business.address && (
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 size-5 shrink-0 text-site-primary" aria-hidden />
                <span className="text-lg">{business.address}</span>
              </li>
            )}
            {p.showHours && business.hours && (
              <li className="flex items-start gap-4">
                <Clock className="mt-1 size-5 shrink-0 text-site-primary" aria-hidden />
                <span className="text-lg">{business.hours}</span>
              </li>
            )}
            {p.showSocial && social.length > 0 && (
              <li className="flex flex-wrap gap-2 pt-2">
                {social.map((s) => (
                  <a key={s.network} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-[var(--site-radius-button)] border border-site-border px-4 py-2 text-sm hover:border-site-primary hover:text-site-primary">
                    {s.label}
                  </a>
                ))}
              </li>
            )}
          </Reveal>
        </div>
        {p.showForm && (
          <Reveal>
            <ContactForm business={business} intro={p.formIntro} demo={mode === "demo"} />
          </Reveal>
        )}
      </div>
    </section>
  );
}
