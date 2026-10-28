"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Images, Plug, Plus, UserRound, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/studio", label: "Projetos", icon: FolderKanban, exact: true },
  { href: "/studio/new", label: "Criar novo site", icon: Plus },
  { href: "/studio/templates", label: "Modelos", icon: LayoutTemplate },
  { href: "/studio/assets", label: "Recursos", icon: Images },
  { href: "/studio/integrations", label: "Integrações", icon: Plug },
  { href: "/studio/settings", label: "Conta", icon: UserRound },
] as const;

export function StudioNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação do Studio">
      <ul className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "scrollbar-thin overflow-x-auto")}>
        {ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors duration-150",
                  active ? "bg-cyan-glow/10 text-cyan-soft" : "text-fg-muted hover:bg-ink-800 hover:text-fg",
                )}
              >
                <Icon className={cn("size-4", active ? "text-cyan-glow" : "text-fg-subtle group-hover:text-fg-muted")} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
