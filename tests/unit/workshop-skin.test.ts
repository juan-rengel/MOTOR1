import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Isolamento do visual próprio da Oficina Real (src/features/site-renderer/skins/workshop.css).
 * O CSS é carregado em todos os sites (pacote comum do renderizador): só o prefixo garante
 * que nada nele alcance a Garagem, a Ótica, a Coleção, o Essencial ou modelos futuros.
 */

const PREFIX = '.site-root[data-template="mechanic-real"]';
const SKIN = path.join(process.cwd(), "src", "features", "site-renderer", "skins", "workshop.css");
const RENDERER = path.join(process.cwd(), "src", "features", "site-renderer", "site-renderer.tsx");

/** At-rules cujo conteúdo são regras comuns (verificadas recursivamente). */
const NESTING_AT_RULES = new Set(["media", "supports"]);

/** Separa por vírgula fora de parênteses e colchetes (ex.: `:is(a, b)` continua inteiro). */
function splitSelectors(prelude: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of prelude) {
    if (char === "(" || char === "[") depth++;
    if (char === ")" || char === "]") depth--;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Lista os problemas de isolamento de um CSS. Analisador mínimo (sem dependências): remove
 * comentários, percorre os blocos { } e confere cada seletor e cada at-rule.
 */
function isolationProblems(css: string): string[] {
  const source = css.replace(/\r\n?/g, "\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const problems: string[] = [];

  function walk(text: string): void {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf("{", i);
      const semicolon = text.indexOf(";", i);
      // Instrução sem bloco (ex.: @import url(...);) antes do próximo bloco.
      if (semicolon !== -1 && (open === -1 || semicolon < open)) {
        const statement = text.slice(i, semicolon).trim();
        if (statement.startsWith("@")) problems.push(`at-rule não permitida: ${statement}`);
        i = semicolon + 1;
        continue;
      }
      if (open === -1) {
        if (text.slice(i).trim()) problems.push(`trecho fora de bloco: ${text.slice(i).trim()}`);
        return;
      }
      // Fim do bloco correspondente.
      let depth = 1;
      let close = open + 1;
      for (; close < text.length && depth > 0; close++) {
        if (text[close] === "{") depth++;
        if (text[close] === "}") depth--;
      }
      if (depth !== 0) {
        problems.push("chaves desbalanceadas");
        return;
      }
      const prelude = text.slice(i, open).trim();
      const body = text.slice(open + 1, close - 1);
      i = close;

      if (prelude.startsWith("@")) {
        const name = /^@([\w-]+)/.exec(prelude)?.[1] ?? "";
        if (NESTING_AT_RULES.has(name)) walk(body);
        else if (name === "keyframes") {
          const animation = prelude.slice("@keyframes".length).trim();
          if (!animation.startsWith("wr-")) problems.push(`@keyframes sem o prefixo "wr-": ${animation}`);
        } else problems.push(`at-rule não permitida: ${prelude}`);
        continue;
      }
      if (body.includes("{")) problems.push(`regra aninhada não permitida em: ${prelude}`);
      for (const selector of splitSelectors(prelude)) {
        if (!selector.startsWith(PREFIX)) problems.push(`seletor sem o prefixo: ${selector}`);
        else if (/(^|[\s>+~(,])(:root|html|body)\b/.test(selector.slice(PREFIX.length))) problems.push(`seletor global não permitido: ${selector}`);
      }
    }
  }

  walk(source);
  return problems;
}

describe("visual próprio da Oficina Real (workshop.css)", () => {
  it("o analisador aceita CSS escopado e recusa cada forma de vazamento", () => {
    const ok = `
      /* comentário com { chaves } e .seletor-solto */
      ${PREFIX} { --wr-a: 1px; }
      ${PREFIX}[data-tier="low"], ${PREFIX} [data-slot="service-card"]:is(:hover, :focus-within) { --wr-b: 0; }
      @media (prefers-reduced-motion: reduce) { ${PREFIX} { --wr-c: 0s; } }
      @supports (color: color-mix(in srgb, red, blue)) { @media (hover: hover) { ${PREFIX} .x { opacity: 1; } } }
      @keyframes wr-sheen { from { opacity: 0; } to { opacity: 1; } }
    `;
    expect(isolationProblems(ok)).toEqual([]);
    expect(isolationProblems(ok.replace(/\n/g, "\r\n"))).toEqual([]);

    const bad: Array<[string, RegExp]> = [
      [".site-root { color: red; }", /sem o prefixo/],
      [`${PREFIX} .a, .site-button { color: red; }`, /sem o prefixo: \.site-button/],
      [`.site-root[data-template="mechanic-cinematic"] { color: red; }`, /sem o prefixo/],
      [`@media (min-width: 1px) { .site-card { color: red; } }`, /sem o prefixo/],
      [":root { --x: 1; }", /sem o prefixo/],
      [`${PREFIX} body { color: red; }`, /seletor global/],
      ["@keyframes pulse { from { opacity: 0; } }", /@keyframes sem o prefixo/],
      ['@import url("x.css");', /at-rule não permitida/],
      ["@font-face { font-family: x; }", /at-rule não permitida/],
      ["@property --x { syntax: '*'; inherits: false; }", /at-rule não permitida/],
      [`@layer skin { ${PREFIX} { color: red; } }`, /at-rule não permitida/],
      [`${PREFIX} { color: red; .solto { color: blue; } }`, /aninhada/],
    ];
    for (const [css, expected] of bad) expect(isolationProblems(css).join(" | "), css).toMatch(expected);
  });

  it("todo seletor de workshop.css começa com o prefixo da Oficina Real", () => {
    const css = readFileSync(SKIN, "utf8");
    expect(isolationProblems(css)).toEqual([]);
    // O arquivo tem regras (o teste não passa por estar vazio).
    expect(css.split(PREFIX).length - 1).toBeGreaterThan(0);
  });

  it("passo 6A: só declara variáveis --wr-* (nenhuma mudança visual)", () => {
    const css = readFileSync(SKIN, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const declarations = [...css.matchAll(/\{([^{}]*)\}/g)].flatMap((m) =>
      (m[1] ?? "")
        .split(";")
        .map((d) => d.trim())
        .filter(Boolean),
    );
    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) expect(declaration, declaration).toMatch(/^--wr-[a-z0-9-]+\s*:/);
  });

  it("o renderizador importa workshop.css depois de site.css", () => {
    const source = readFileSync(RENDERER, "utf8");
    const base = source.indexOf('import "./site.css";');
    const skin = source.indexOf('import "./skins/workshop.css";');
    expect(base).toBeGreaterThan(-1);
    expect(skin).toBeGreaterThan(base);
  });
});
