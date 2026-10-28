"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { MotionSettings } from "@/domain/motion";
import { detectDeviceTier, prefersReducedMotion, subscribeNever, subscribeReducedMotion, type DeviceTier } from "./device";
import { LEVEL_PROFILES, type LevelProfile } from "./tokens";

export interface EffectiveMotion {
  /** Falso quando o usuário prefere movimento reduzido ou o projeto desligou animações. */
  enabled: boolean;
  settings: MotionSettings;
  profile: LevelProfile;
  tier: DeviceTier;
  reducedMotion: boolean;
}

const MotionContext = createContext<EffectiveMotion | null>(null);

/**
 * Calcula o movimento efetivo combinando: configuração do projeto, preferência
 * do sistema operacional (prefers-reduced-motion) e capacidade do dispositivo.
 */
export function MotionProvider({
  settings,
  forceDisabled = false,
  children,
}: {
  settings: MotionSettings;
  forceDisabled?: boolean;
  children: ReactNode;
}) {
  // No servidor: sem preferência e nível "médio"; no cliente, valores reais (sem divergência de hidratação).
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const tier = useSyncExternalStore<DeviceTier>(subscribeNever, detectDeviceTier, () => "medium");
  const value = useMemo<EffectiveMotion>(() => {
    const enabled = !forceDisabled && !reducedMotion && settings.level !== "none";
    const base = LEVEL_PROFILES[enabled ? settings.level : "none"];
    const profile: LevelProfile =
      tier === "low" ? { ...base, parallax: 0, imageScale: Math.min(base.imageScale, 1.05) } : base;
    return {
      enabled,
      settings: enabled ? { ...settings, parallax: settings.parallax && tier !== "low" } : settings,
      profile,
      tier,
      reducedMotion,
    };
  }, [settings, forceDisabled, reducedMotion, tier]);

  useEffect(() => {
    (window as Window & { __cwsReady?: boolean }).__cwsReady = true;
    if (!value.enabled) document.documentElement.classList.remove("cws-js");
  }, [value.enabled]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): EffectiveMotion {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion precisa de <MotionProvider>.");
  return ctx;
}
