import { getCopyPack, PRIMARY_CTA_BY_GOAL } from "./copy-packs";
import type { ContentGenerator, ContentRequest, ContentSuggestion, ContentVariant } from "./types";

/**
 * Gerador determinístico baseado em regras e modelos de texto.
 * NÃO usa inteligência artificial nem serviços externos; não tem custo.
 * Serve como modo funcional enquanto nenhum provedor de IA estiver configurado.
 */
export class LocalRulesContentGenerator implements ContentGenerator {
  readonly info = { id: "local-rules", label: "Regras locais (sem IA)", kind: "rules" as const };

  async generate(request: ContentRequest): Promise<ContentSuggestion> {
    const { business, task } = request;
    const pack = getCopyPack(business.segment);
    let variants: ContentVariant[];

    switch (task) {
      case "hero":
        variants = pack.heroTitles.map((title) => ({ title, subtitle: pack.heroSubtitle(business) }));
        break;
      case "seo": {
        const city = business.city ? ` em ${business.city}` : "";
        const base = pack.heroSubtitle(business).slice(0, 160);
        variants = [
          { title: `${business.name}${city}`.slice(0, 70), description: base },
          { title: `${business.name} — ${pack.heroTitles[0] ?? ""}`.slice(0, 70), description: base },
        ];
        break;
      }
      case "cta":
        variants = [
          { label: PRIMARY_CTA_BY_GOAL[business.goal], message: pack.whatsappMessage(business) },
          { label: "Falar no WhatsApp", message: pack.whatsappMessage(business) },
        ];
        break;
      case "about":
        variants = [{ text: pack.aboutText(business) }];
        break;
      case "services":
        variants = business.offerings.map((offering) => ({
          title: offering,
          description: pack.offeringDescription(offering, business),
        }));
        break;
    }

    return {
      task,
      provider: this.info,
      variants,
      notice:
        "Sugestões montadas por regras locais a partir dos dados do negócio — não foram geradas por IA. Revise antes de publicar.",
    };
  }
}
