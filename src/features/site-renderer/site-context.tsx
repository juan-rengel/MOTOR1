"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Project } from "@/domain/project";

export type RenderMode = "live" | "editor" | "demo";

interface SiteContextValue {
  project: Project;
  mode: RenderMode;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ project, mode, children }: SiteContextValue & { children: ReactNode }) {
  return <SiteContext.Provider value={{ project, mode }}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite precisa de <SiteProvider>.");
  return ctx;
}
