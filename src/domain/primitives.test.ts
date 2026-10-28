import { isSafeHref, isSafeMediaSrc } from "./primitives";

describe("isSafeMediaSrc", () => {
  it("aceita caminhos locais, https e vazio", () => {
    expect(isSafeMediaSrc("")).toBe(true);
    expect(isSafeMediaSrc("/assets/demo/a.jpg")).toBe(true);
    expect(isSafeMediaSrc("https://cdn.exemplo.com/a.jpg")).toBe(true);
  });
  it("rejeita esquemas e caminhos perigosos", () => {
    expect(isSafeMediaSrc("javascript:alert(1)")).toBe(false);
    expect(isSafeMediaSrc("data:image/svg+xml;base64,AAA")).toBe(false);
    expect(isSafeMediaSrc("//evil.com/a.jpg")).toBe(false);
    expect(isSafeMediaSrc("/assets/../../etc/passwd")).toBe(false);
    expect(isSafeMediaSrc("http://inseguro.com/a.jpg")).toBe(false);
  });
});

describe("isSafeHref", () => {
  it("aceita âncoras, caminhos, http(s), mailto e tel", () => {
    for (const v of ["#contato", "/preview/x", "https://a.com", "http://a.com", "mailto:a@b.com", "tel:+5511"]) {
      expect(isSafeHref(v)).toBe(true);
    }
  });
  it("rejeita javascript:, data: e âncoras inválidas", () => {
    for (const v of ["javascript:void(0)", "JaVaScRiPt:alert(1)", "data:text/html,x", "#<x>", "", "//evil.com"]) {
      expect(isSafeHref(v)).toBe(false);
    }
  });
});
