# Arquitetura — Motor 1

## Visão geral

```
Navegador                                   Servidor (Next.js)                     Disco local
─────────                                   ──────────────────                     ───────────
Studio (React, client)  ──fetch JSON──►  /api/projects, /api/assets  ──►  Repositório ──► .data/projects/*.json
   │                                      /api/content/generate             (interface)    .data/uploads/*
   │ postMessage (zod)                          │
   ▼                                            ▼
iframe /frame  ── SiteRenderer ◄── mesmo componente ── /preview/[id], /demo/[modelo] (SSR)
                     │
                     ├─ seções (registro tipo → componente)
                     ├─ motor de animações (GSAP + ScrollTrigger)
                     └─ motor 3D (React Three Fiber, carregado sob demanda)
```

Duas experiências separadas:

- **Studio** (administração): visual escuro com ciano, tokens `ink-*`, `cyan-*` em `src/app/globals.css`.
- **Sites gerados**: tokens `site-*` alimentados pelo tema de cada projeto (`theme-vars.ts`). Nenhum site herda o visual do Studio.

## Decisões técnicas

| Decisão | Motivo |
|---|---|
| Next.js 16 (App Router) com Cache Components | Padrão atual do framework. Páginas com dados locais usam `<Suspense>` + `connection()` para nunca congelar dados no build. |
| Zod como fonte única de tipos | Os mesmos schemas validam no navegador (feedback imediato) e no servidor (decisão final). Tipos TypeScript são inferidos deles. |
| Projeto = documento JSON validado | Estrutura previsível e extensível; facilita migrar para Firestore (documento por projeto). `schemaVersion` + `domain/migrations.ts` para evoluções. |
| Persistência atrás de interface (`ProjectRepository`) | Troca de driver (arquivos → Firebase) sem tocar em rotas ou componentes. |
| Controle de revisão (`revision`) | Evita que duas abas sobrescrevam uma à outra (HTTP 409 + diálogo no editor). |
| Prévia do editor em `iframe` | Media queries reais por largura de dispositivo, isolamento de CSS/rolagem, mesmo renderizador da versão final. Comunicação por `postMessage` com verificação de origem e validação zod. |
| Editor por reducer (sem manipular DOM) | Estado previsível, desfazer/refazer, agrupamento de digitação. |
| Campos declarativos por seção (`section-fields.ts`) | O painel de propriedades é gerado; novos campos não exigem componentes novos. |
| GSAP + ScrollTrigger (via `@gsap/react`) | Animações de rolagem robustas; limpeza automática com `useGSAP`. |
| React Three Fiber + drei, só onde há 3D | three.js é carregado sob demanda (`lazy`) apenas quando a seção "História 3D" se aproxima da tela. |
| Cenas procedurais | Sem dependência de modelos externos ou URLs que podem sair do ar; as imagens de demonstração são geradas a partir das cenas. |
| Ambiente de luz com Lightformers | Reflexos de estúdio sem baixar arquivos HDR externos. |
| Fontes via `@fontsource` | Servidas pelo próprio projeto; sem chamadas a serviços de fontes. |

## Dados

`src/domain/project.ts`:

- `business` — dados do negócio (nome, segmento, contatos, redes, objetivo).
- `theme` — cores, fontes, cantos, caixa dos títulos, granulação.
- `motion` — nível (nenhum/sutil/equilibrado/cinematográfico) e efeitos.
- `scene` — cena 3D, movimento de câmera, qualidade, cores, imagem substituta, modelo GLB, variação.
- `sections[]` — união discriminada de 12 tipos de seção (`src/domain/sections.ts`).
- `seo`, `publishing` (status, slug, domínio desejado), `flags.demoContent`.
- `ownerId`, `revision`, `createdAt`, `updatedAt`, `schemaVersion`.

Separação conceitual para a evolução SaaS: plataforma (Studio) · proprietário (`ownerId`) · projeto · conteúdo (`sections`) · modelo (`templateId`) · recursos (biblioteca) · publicação (`publishing`) · site público (renderizador).

## Seções

| Tipo | Uso |
|---|---|
| `hero` | Capa com imagem, vídeo ou gradiente |
| `sceneStory` | Abertura 3D: cena fixa + capítulos que rolam por cima |
| `services` | Serviços em grade ou lista |
| `catalog` | Produtos com filtros e pedido pelo WhatsApp |
| `gallery` | Grade, mosaico ou faixa, com visualizador ampliado |
| `editorial` | Blocos imagem/texto alternados (lookbook) |
| `about` | História e destaques |
| `steps` | Etapas com linha de progresso na rolagem |
| `marquee` | Faixa de palavras em movimento |
| `cta` | Chamada para ação |
| `faq` | Acordeão nativo |
| `contact` | Contatos + formulário que abre WhatsApp/e-mail |

Para criar um tipo novo: schema em `domain/sections.ts` → padrão em `features/sections/create-section.ts` → componente em `features/site-renderer/sections/` + registro em `section-registry.tsx` → campos em `features/editor/section-fields.ts`.

## Modelos

`src/features/templates/*.ts` implementam `TemplateDefinition`: segmentos, estilo padrão, ajustes de tema por estilo, cena 3D, seções iniciais (usando os dados do negócio quando informados) e um negócio fictício para a demonstração. Registro em `registry.ts`.

Há dois tipos de modelo (`kind`):

- **dedicado** (padrão): traz textos, imagens e cena 3D do próprio segmento e **só pode ser usado nos segmentos de `segments`**. O assistente oferece apenas os dedicados ao segmento escolhido, e o servidor recusa outras combinações (`isTemplateCompatible`, verificado em `createProjectFromTemplate`; resposta 422).
- **universal**: base neutra aceita em qualquer segmento. O **Essencial** (`universal-essential`) usa só os textos do segmento escolhido e os dados do negócio, sem imagens e sem cena 3D. É o recomendado para segmentos sem modelo dedicado e aparece como "Base neutra" nos demais.

Projetos criados antes dessa regra continuam abrindo e editando normalmente: a verificação vale apenas na criação.

| Modelo | Segmentos | Cena | Estrutura |
|---|---|---|---|
| Garagem Cinematográfica | Oficina mecânica | Carro | História 3D, faixa, serviços, processo, estrutura, sobre, dúvidas, orçamento, contato |
| Ótica Atelier | Ótica | Óculos (4 formatos) | História 3D, catálogo de armações, editorial de atendimento, passo a passo, sobre, dúvidas, chamada, contato |
| Coleção Editorial | Roupas e tênis | Tecido (roupas) ou tênis | História 3D, faixa, catálogo com pedido, lookbook, galeria, como comprar, dúvidas, chamada, contato |
| Essencial (universal) | Todos (recomendado para os segmentos sem modelo dedicado) | Nenhuma | Capa em degradê, serviços, como funciona, sobre, dúvidas, chamada, contato |

## Motor de animações (`features/animations`)

- `tokens.ts`: durações, curvas, perfis por nível de movimento.
- `motion-context.tsx`: combina configuração do projeto, `prefers-reduced-motion` e capacidade do aparelho (`device.ts`), via `useSyncExternalStore` (sem divergência de hidratação).
- `Reveal`, `SplitText`, `ImageReveal`, `Parallax`: componentes reutilizáveis; quando o movimento está desligado, o conteúdo aparece normalmente.
- Páginas renderizadas no servidor recebem um script mínimo (`site-motion-script.ts`) que esconde elementos animáveis antes da primeira pintura, com salvaguarda de 3,5 s caso o JavaScript falhe.
- Gatilhos usam `toggleActions: "play none none none"` em vez de `once: true` (este último quebrava o `ScrollTrigger.refresh()` ao abrir a página já rolada para uma âncora).

## Motor 3D (`features/scenes3d`)

- `registry.ts`: cenas, momentos de câmera, variações; `lazy-scenes.ts`: componentes carregados sob demanda.
- `scene-host.tsx`: imagem substituta imediata, carregamento ao se aproximar da tela, pausa fora da tela (`frameloop="never"`), detecção de WebGL, aparelhos fracos com botão "Ver em 3D", captura de erros.
- `scene-canvas.tsx`: tom ACES, resolução limitada por nível, `AdaptiveDpr` com monitor de desempenho.
- `shared/camera-rig.tsx`: câmera cinematográfica em coordenadas esféricas, amortecida, com deslocamento de lente para enquadrar ao lado do texto e ajuste automático em telas verticais.
- `shared/sculpt.ts`: extrusão de perfil + subdivisão + deformação + solda de vértices (carro e tênis).
- `shared/product-stage.tsx`, `shared/studio-environment.tsx`: palco, luzes, ambiente, oclusão.
- Recursos de GPU criados fora do JSX são liberados ao desmontar (`dispose`).

## Pré-visualização do editor

`features/editor/frame-protocol.ts` define as mensagens:

- pai → iframe: `cws:render` (projeto completo, seção selecionada, movimento), `cws:scroll-to`.
- iframe → pai: `cws:ready`, `cws:select` (clique numa seção), `cws:invalid`.

Ambos os lados conferem `event.origin` e `event.source` e validam com zod.
