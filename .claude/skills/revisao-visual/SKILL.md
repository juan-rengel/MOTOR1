---
name: revisao-visual
description: Revisão visual dos sites gerados e do Studio do MOTOR1 — capturas em 390, 834 e 1440 px, com e sem movimento, com e sem WebGL, avaliadas por critérios de layout, tipografia, cor, imagem, animação, 3D e acessibilidade. Use após mudanças em modelos, seções, tema, cenas 3D ou páginas, e quando pedirem para avaliar a qualidade visual.
---

# Revisão visual

Objetivo: julgar o resultado **como o visitante vê**, com evidência (capturas), e não pelo código. A revisão não altera arquivos do projeto.

## O que revisar

| Alvo | Rota |
|---|---|
| Demonstração de um modelo | `/demo/<templateId>` (ids em `src/features/templates/registry.ts`) |
| Projeto salvo | `/preview/<id>` |
| Studio | `/`, `/studio`, `/studio/new`, `/studio/templates`, editor em `/studio/projects/<id>` |

## Procedimento

1. **Servidor**: use o que já estiver rodando (`npm run dev`, porta 3000) ou peça para iniciar. Não use a porta 3100 (reservada aos testes ponta a ponta).
2. **Script de captura temporário**: escreva um script Playwright **fora do repositório** (pasta de rascunho da sessão; se precisar ficar dentro do projeto, use apenas pastas ignoradas pelo Git, como `test-results/`). Não adicione o script ao projeto sem aprovação.
   - Larguras: **390×844** (celular), **834×1112** (tablet), **1440×900** (desktop).
   - Para cada largura: captura da primeira dobra e captura de página inteira.
   - Antes da página inteira, role até o fim em passos (ex.: 600 px, pausa de 250 ms) para disparar as revelações e o carregamento do 3D; depois volte ao topo.
   - 3D sem GPU: lançar o Chromium com `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` e aguardar `[data-scene-ready]` (até 120 s).
   - Variações obrigatórias:
     - `reducedMotion: "reduce"` (todo o conteúdo deve aparecer sem animação);
     - sem WebGL (`HTMLCanvasElement.prototype.getContext` retornando `null` para `webgl`/`webgl2` via `addInitScript`), para conferir a imagem substituta.
   - Registre erros do console e respostas HTTP ≥ 400.
3. **Abra e examine cada captura** (ferramenta de leitura de imagem). Não conclua nada sem ter visto a imagem.
4. **Compare modelos lado a lado** quando a pergunta for diferenciação entre segmentos.

## Critérios

**Layout e composição**
- Hierarquia clara na primeira dobra: o que é, para quem, qual a ação principal.
- Sem sobreposição indevida (texto sobre objeto 3D, botões cortados), sem rolagem horizontal, sem espaços vazios acidentais.
- Ritmo entre seções consistente; seções alternam densidade e não parecem repetidas.
- Celular: navegação utilizável, alvos de toque ≥ 44 px, CTA visível sem rolar muito, WhatsApp flutuante sem cobrir conteúdo.

**Tipografia**
- No máximo duas famílias; escala coerente; títulos sem quebras feias (palavra isolada, hifenização estranha).
- Linhas de texto corrido entre ~45 e 80 caracteres; contraste e peso legíveis no celular.

**Cor e contraste**
- Texto e botões com contraste AA (4,5:1 normal, 3:1 grande); cor primária com papel claro (ação), não espalhada.
- Identidade do site independente do Studio.

**Imagens e mídia**
- Nítidas na largura exibida, sem distorção, recorte preservando o assunto.
- Coerentes com o segmento (nenhuma imagem de outro segmento).
- Texto alternativo descritivo; conteúdo demonstrativo sinalizado.

**Movimento e 3D**
- Animações ajudam a leitura (revelação, foco), sem atrasar o conteúdo; nada piscando ou travando.
- Movimento reduzido: conteúdo completo e estático.
- 3D: enquadrado, sem objetos cortados ou atravessando texto, iluminação sem manchas; imagem substituta equivalente quando não há WebGL.

**Conteúdo**
- Nenhum depoimento, avaliação, número ou certificação inventados; telefones só os informados pelo usuário.
- Textos sem erros de português e coerentes com o segmento.

## Relatório

Para cada alvo e largura: ✅/⚠️/❌ por grupo de critérios, com a captura de referência e o problema descrito de forma acionável (onde, o que, sugestão). Classifique por severidade: **bloqueante** (quebra, conteúdo errado, inacessível), **importante** (qualidade visual visível), **refinamento**.

Envie as capturas mais relevantes ao usuário. Correções viram um plano que **aguarda aprovação** antes de qualquer alteração.
