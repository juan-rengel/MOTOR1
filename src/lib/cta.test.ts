import type { BusinessInfo } from "@/domain/business";
import { emptySocialLinks } from "@/domain/business";
import { resolveCta } from "./cta";

const business: BusinessInfo = {
  name: "Teste",
  segment: "mechanic",
  city: "",
  description: "",
  offerings: [],
  audience: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
  social: emptySocialLinks(),
  goal: "quote",
};

describe("resolveCta", () => {
  it("oculta botões sem rótulo", () => {
    expect(resolveCta({ label: " ", action: "link", target: "https://x.com" }, business)).toEqual({ status: "hidden" });
  });

  it("marca WhatsApp como indisponível quando não há número", () => {
    const r = resolveCta({ label: "Chamar", action: "whatsapp", target: "Oi" }, business);
    expect(r.status).toBe("unavailable");
  });

  it("gera link de WhatsApp com número configurado", () => {
    const r = resolveCta({ label: "Chamar", action: "whatsapp", target: "Oi" }, { ...business, whatsapp: "11912345678" });
    expect(r).toEqual({ status: "ok", href: "https://wa.me/5511912345678?text=Oi", external: true, label: "Chamar" });
  });

  it("resolve âncoras de seção", () => {
    expect(resolveCta({ label: "Ver", action: "section", target: "#servicos" }, business)).toMatchObject({
      status: "ok",
      href: "#servicos",
    });
  });

  it("bloqueia links perigosos", () => {
    const r = resolveCta({ label: "x", action: "link", target: "javascript:alert(1)" }, business);
    expect(r.status).toBe("unavailable");
    const d = resolveCta({ label: "x", action: "link", target: "data:text/html,oi" }, business);
    expect(d.status).toBe("unavailable");
  });
});
