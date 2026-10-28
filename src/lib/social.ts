import type { SocialLinks, SocialNetwork } from "@/domain/business";

const BASE_URLS: Record<SocialNetwork, string | null> = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://www.tiktok.com/@",
  youtube: "https://youtube.com/@",
  linkedin: "https://www.linkedin.com/company/",
  website: null,
};

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  website: "Site",
};

/**
 * Converte o valor informado (URL completa ou @usuario) em uma URL https.
 * Retorna null quando o valor não é utilizável com segurança.
 */
export function resolveSocialUrl(network: SocialNetwork, value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) {
    try {
      const url = new URL(v);
      return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
      return null;
    }
  }
  const base = BASE_URLS[network];
  if (!base) {
    return /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(v) ? `https://${v}` : null;
  }
  const handle = v.replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(handle)) return null;
  return base + handle;
}

export function listSocialLinks(social: SocialLinks): Array<{ network: SocialNetwork; label: string; url: string }> {
  return (Object.keys(social) as SocialNetwork[]).flatMap((network) => {
    const url = resolveSocialUrl(network, social[network]);
    return url ? [{ network, label: SOCIAL_LABELS[network], url }] : [];
  });
}
