import { buildTelLink, buildWhatsAppLink, formatPhoneForDisplay, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("adiciona o código do Brasil a números com DDD", () => {
    expect(normalizePhone("(11) 91234-5678")).toEqual({ ok: true, e164Digits: "5511912345678" });
    expect(normalizePhone("11 3456-7890")).toEqual({ ok: true, e164Digits: "551134567890" });
  });

  it("mantém números internacionais iniciados com +", () => {
    expect(normalizePhone("+1 415 555 0100")).toEqual({ ok: true, e164Digits: "14155550100" });
  });

  it("aceita número já com 55", () => {
    expect(normalizePhone("+55 21 99876-5432")).toEqual({ ok: true, e164Digits: "5521998765432" });
  });

  it("remove zero de discagem à esquerda", () => {
    expect(normalizePhone("0 11 91234-5678")).toEqual({ ok: true, e164Digits: "5511912345678" });
  });

  it("rejeita entradas vazias, curtas ou brasileiras malformadas", () => {
    expect(normalizePhone("").ok).toBe(false);
    expect(normalizePhone("123").ok).toBe(false);
    expect(normalizePhone("+55 11 123").ok).toBe(false);
    expect(normalizePhone("abc").ok).toBe(false);
  });
});

describe("links", () => {
  it("cria link wa.me com mensagem codificada", () => {
    expect(buildWhatsAppLink("11 91234-5678", "Olá! Quero um orçamento & prazo")).toBe(
      "https://wa.me/5511912345678?text=Ol%C3%A1!%20Quero%20um%20or%C3%A7amento%20%26%20prazo",
    );
  });

  it("não cria link sem número válido", () => {
    expect(buildWhatsAppLink("", "oi")).toBeNull();
    expect(buildTelLink("12")).toBeNull();
  });

  it("formata para exibição", () => {
    expect(formatPhoneForDisplay("11912345678")).toBe("+55 (11) 91234-5678");
    expect(formatPhoneForDisplay("1134567890")).toBe("+55 (11) 3456-7890");
  });
});
