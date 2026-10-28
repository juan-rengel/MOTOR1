"use client";

import { listSocialLinks } from "@/lib/social";
import { formatPhoneForDisplay, buildTelLink } from "@/lib/phone";
import { useSite } from "../site-context";

export function SiteFooter() {
  const { project } = useSite();
  const { business, sections, seo } = project;
  const social = listSocialLinks(business.social);
  const nav = sections.filter((s) => !s.hidden && s.navLabel.trim());
  const tel = buildTelLink(business.phone);
  const year = new Date(project.updatedAt).getFullYear();

  return (
    <footer className="border-t border-site-border bg-site-bg">
      <div className="site-container grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="site-heading text-2xl">{business.name}</p>
          {seo.description && <p className="mt-3 max-w-sm text-sm text-site-muted">{seo.description}</p>}
        </div>
        {nav.length > 0 && (
          <nav aria-label="Rodapé">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-site-muted uppercase">Navegação</p>
            <ul className="space-y-2 text-sm">
              {nav.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.anchor}`} className="text-site-text/80 hover:text-site-primary">
                    {s.navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {(tel || business.email || business.address || social.length > 0) && (
        <div className="space-y-2 text-sm text-site-text/80">
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-site-muted uppercase">Contato</p>
          {tel && (
            <p>
              <a href={tel} className="hover:text-site-primary">
                {formatPhoneForDisplay(business.phone)}
              </a>
            </p>
          )}
          {business.email && (
            <p>
              <a href={`mailto:${business.email}`} className="hover:text-site-primary">
                {business.email}
              </a>
            </p>
          )}
          {business.address && <p>{business.address}</p>}
          {social.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {social.map((s) => (
                <li key={s.network}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-site-primary">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}
      </div>
      <div className="border-t border-site-border/60">
        <p className="site-container py-6 text-xs text-site-muted">
          © {year} {business.name}
        </p>
      </div>
    </footer>
  );
}
