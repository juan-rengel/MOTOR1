# STATUS — Cinematic Web Studio (Motor 1)

Última atualização: 31/10/2026.

## Fases

| Fase | Situação | Observações |
|---|---|---|
| 0 — Diagnóstico | ✅ Concluída | Node 22, npm 10, Git; ambiente de desenvolvimento em Linux (contêiner). Projeto pensado para Windows 11 (scripts sem comandos específicos de sistema). |
| 1 — Fundação | ✅ Concluída | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript estrito, Tailwind 4, zod, Vitest, Playwright, ESLint. |
| 2 — Interface principal | ✅ Concluída | Página inicial, Studio (projetos, novo site, modelos, recursos, integrações, conta), assistente em 4 etapas. |
| 3 — Primeiro site | ✅ Concluída | Modelo "Garagem Cinematográfica" (oficina mecânica), 12 tipos de seção. |
| 4 — Motor cinematográfico | ✅ Concluída | Animações (GSAP), cena 3D do carro com câmera na rolagem, substituto, pausa fora da tela. |
| 5 — Editor | ✅ Concluída | Seções, conteúdo, identidade, movimento, cena 3D, projeto, publicação; prévia responsiva; desfazer/refazer. |
| 6 — Persistência | ✅ Concluída (local) | Arquivos JSON em `.data/` com validação, revisão e escrita atômica. |
| 7 — Novos modelos | ✅ Concluída | "Ótica Atelier" e "Coleção Editorial" (roupas/tênis); cenas de óculos, tênis, tecido e GLB próprio. |
| 8 — IA | ⏸ Aguardando decisão | Contrato e gerador de regras locais prontos. Falta escolher provedor, custos e credenciais. |
| 9 — Firebase | ⏸ Aguardando projeto | Contratos de repositório/identidade prontos. Falta criar o projeto Firebase. |
| 10 — Testes e publicação | 🟡 Parcial | Testes completos executados; requisitos de publicação documentados. Hospedagem real não implementada. |

## Plano de evolução (após o diagnóstico de 30/10/2026)

| Etapa | Situação | Observações |
|---|---|---|
| 0 — Instruções e skills do Claude Code | ✅ Concluída (30/10/2026) | `CLAUDE.md` (regras permanentes), `.claude/settings.json` (permissões: verificação liberada; instalação, `npx`, commit, push e geração de mídia sob confirmação; segredos `.env`, recursos de demonstração existentes, publicação e comandos destrutivos bloqueados) e skills `novo-modelo-segmento`, `revisao-visual`, `verificar`, `recursos-demo`. Auditoria final com 10 correções aplicadas. `.gitignore` passa a ignorar `.claude/settings.local.json`. Nenhum componente, página, modelo, teste ou recurso alterado. |
| 1A — Fim do conteúdo de outro segmento | ✅ Concluída (30/10/2026, commit `f1ac997`) | Modelo universal **Essencial** (`universal-essential`: sem imagens e sem cena 3D, textos do segmento escolhido). O assistente oferece só os modelos dedicados ao segmento e o Essencial; o servidor recusa modelo dedicado em outro segmento (422). Pacotes de texto novos para barbearia/salão, restaurante, móveis e serviços. Os 3 modelos antigos geram exatamente o mesmo conteúdo (referência fixa) e as demonstrações ficaram idênticas pixel a pixel. Projetos antigos continuam abrindo. |
| 1B — Imagens e proteção contra regressões | ✅ Concluída (31/10/2026, commits `b4c6452`, `4b2a5aa`, `9f490ec`, `fddcd97`) | **Proteção:** hashes de 82 arquivos protegidos, referência fixa do Essencial (96 combinações; ampliada para 112 na Etapa 1C.1), regressão visual dos 4 modelos em 390/834/1440 px (8,02 MB de referências; imagens mascaradas na própria camada nos modelos antigos, Essencial sem máscara; granulação oculta só na captura e verificada à parte; tolerância de 1% de cor, zero pixels acima). **ESLint** ignora `playwright-report/` e `test-results/`. **Imagens:** otimizador nativo do Next só para `/assets/demo` (WebP, qualidade 75), `sizes` por seção, capa com `fetchpriority="high"`; uploads e URLs externas sem otimização (uploads reavaliados na Fase 9 — ver SEGURANCA.md). **Orçamento de bytes** por demonstração. Modelos protegidos idênticos (referências visuais e fixas). |
| 1C.1 — Segmentos na ordem oficial | ✅ Implementada (31/10/2026), aguardando aprovação final e commit | **14 segmentos.** Novos: **Barbearia** (`barbershop`) e **Loja de variedades** (`variety`), acrescentados no fim da lista de ids. **Beleza** (`beauty`, antes "Barbearia e salão") passa a tratar de unhas, cílios, sobrancelhas e cabelo; **Loja de calçados** (`sneakers`, antes "Loja de tênis") ganha descrição e sugestões de calçados — ids mantidos, sem migração. Assistente com os seis segmentos prioritários primeiro (Mecânica, Barbearia, Beleza, Roupas, Calçados, Variedades). Textos novos de Barbearia e Variedades; textos de Beleza reescritos; pacote `sneakers` byte a byte inalterado (usado pela Coleção Editorial). Os novos segmentos usam o Essencial até terem modelo dedicado. Referência do Essencial: 112 combinações. Modelos protegidos intactos. |
| 1C (demais) — Seções e modelos por segmento | ⏸ Aguardando plano | Conforme o planejamento aprovado da 1C: seções novas e modelos dedicados intercalados por segmento, na ordem oficial, começando pela Mecânica. |
| 2 a 8 | ⏸ Aguardando aprovação | Cada etapa começa com plano apresentado e aprovação explícita. Dados estruturados `LocalBusiness` (JSON-LD) ficam para a Etapa 6 (decisão D2). |

## Arquitetura atual

Resumo em [`ARQUITETURA.md`](ARQUITETURA.md). Pontos centrais:

- Domínio em `src/domain` (zod) — projeto como documento JSON versionado.
- Renderizador único (`src/features/site-renderer`) usado no editor, na pré-visualização e nas demonstrações.
- Motores independentes: animações (`features/animations`) e 3D (`features/scenes3d`).
- Servidor isolado em `src/server` (armazenamento, identidade, HTTP), com contratos para trocar de driver.

## Funcionalidades existentes

- Criação de projeto (dados do negócio com validação de telefone/e-mail/redes, estilo visual, modelo recomendado por segmento, revisão).
- 3 modelos dedicados + o modelo universal Essencial, 8 estilos, 14 segmentos configurados — no assistente, os seis prioritários primeiro: Oficina mecânica, Barbearia, Beleza, Loja de roupas, Loja de calçados e Loja de variedades. Modelos dedicados só são oferecidos (e aceitos pelo servidor) no próprio segmento.
- Imagens de demonstração otimizadas pelo Next (tamanhos sob medida, WebP qualidade 75), capa com prioridade alta de carregamento; uploads e URLs externas entregues sem otimização.
- Editor: reordenar/adicionar/duplicar/ocultar/remover seções (remoção com confirmação), campos gerados por definição, seletor de mídia (biblioteca, upload, URL https), botões com ação (WhatsApp, seção, link, telefone, e-mail) e alerta quando o destino falta, cores com contraste calculado, fontes, cantos, logotipo, movimento, cena 3D (cena, variação, câmera, qualidade, ambiente, cores, imagem substituta, GLB), SEO, slug, domínio desejado, exportação JSON.
- Verificações de qualidade (conteúdo demonstrativo, botões sem destino, imagens sem texto alternativo, contraste, GLB ausente, SEO).
- Sugestões de texto por regras locais (rotuladas "sem IA").
- Biblioteca de recursos com upload validado por assinatura, licença e texto alternativo.
- Cenas 3D: carro, óculos (quadrado, redondo, gatinho, aviador), tênis, tecido, GLB próprio. Imagens de demonstração geradas a partir delas.

## Testes realizados (última execução: 31/10/2026, Etapa 1C.1 — passo 5)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | ✅ sem erros |
| Lint | `npm run lint` | ✅ 0 problemas (antes e depois da suíte ponta a ponta) |
| Unitários/integração | `npm run test` | ✅ 340 testes, 11 arquivos (inclui integridade de 82 arquivos protegidos, referência fixa dos modelos antigos — 36 combinações —, referência do Essencial — 112 combinações — e 24 testes de segmentos) |
| Build de produção | `npm run build` | ✅ sem avisos |
| Ponta a ponta | `npm run test:e2e` | ✅ 77 testes (inclui 12 capturas de regressão visual, 8 verificações da granulação, 4 de imagens, 4 de orçamento de bytes e 3 do assistente com os segmentos novos) |

### Etapa 1C.1 — comparação da referência do Essencial

Projetos completos gerados antes (`fddcd97`) e depois, comparados campo a campo:

- **80 entradas idênticas** (10 segmentos × 8 estilos: mecânica, advocacia, odontologia, ótica, roupas, móveis, academia, restaurante, serviços e outro).
- **16 alteradas** só em campos de texto autorizados: Beleza (título pequeno, título e subtítulo da capa; serviços — que passam de 5 para 4: Unhas, Cílios, Sobrancelhas, Cabelo; texto "Sobre"; descrição de SEO) e Loja de calçados (título pequeno da capa; serviços Tênis, Sapatos sociais, Sandálias, Botas, Infantil).
- **16 novas** (Barbearia e Loja de variedades × 8 estilos), com a mesma estrutura do Essencial nos demais segmentos.
- Tema, movimento, cena 3D, publicação, ordem/tipos/âncoras das seções e demais propriedades: idênticos. Total: **112**.
- Arquivo de hashes: só 3 entradas atualizadas (`src/domain/business.ts`, `copy-packs.ts`, referência do Essencial); as outras 79 e as pastas fechadas idênticas.
- Referência fixa dos modelos antigos e as 12 referências visuais: inalteradas.

### Bytes por demonstração antes e depois da Etapa 1B

Celular 390×844 com tela 3×, sem WebGL, página inteira percorrida (mesmo script antes e depois; duas medições idênticas):

| Demonstração | Imagens (antes → depois) | Total (antes → depois) |
|---|---|---|
| Garagem | 386 → 120 KB | 776 → 516 KB |
| Ótica Atelier | 464 → 154 KB | 887 → 583 KB |
| Coleção Editorial | 291 → 82 KB | 698 → 496 KB |
| Essencial | 0 → 0 KB | 382 → 387 KB (+5 KB do componente de imagem do Next) |

Limites do orçamento (`tests/e2e/budget.spec.ts`, medição + 3%): Garagem 532/124 KB, Ótica 601/159 KB, Coleção 511/85 KB, Essencial 399/0 KB (total/imagens). CLS 0,000 em todas.

### Comparação WebP × AVIF (31/10/2026) — WebP continua sendo o formato adotado

Mesmo servidor (cópia temporária do commit `9f490ec` com AVIF habilitado só nela), as 36 imagens de demonstração, larguras 640 e 1080, qualidade 75; só o formato pedido muda. O WebP da cópia é idêntico byte a byte ao do projeto. Qualidade medida contra o original reduzido ao mesmo tamanho.

| Formato | Largura | Bytes (36 imagens) | PSNR médio | SSIM médio (mín.) | 1ª conversão (mediana / máx.) | Servida do cache (mediana) |
|---|---|---|---|---|---|---|
| WebP | 640 | 253 KB | 42,5 dB | 0,9916 (0,9847) | 71 / 188 ms | 2,7 ms |
| AVIF | 640 | 171 KB (−32%) | 44,0 dB | 0,9938 (0,9905) | 256 / 385 ms | 2,8 ms |
| WebP | 1080 | 466 KB | 43,6 dB | 0,9926 (0,9890) | 98 / 133 ms | 2,6 ms |
| AVIF | 1080 | 322 KB (−31%) | 44,8 dB | 0,9939 (0,9895) | 496 / 650 ms | 2,8 ms |

Por página (celular, página inteira), imagens WebP → AVIF: Garagem 120 → 84 KB, Ótica 154 → 109 KB, Coleção 82 → 65 KB. Visualmente, os dois são indistinguíveis do original no tamanho real; ampliados, o AVIF suaviza levemente texturas finas e o WebP mostra leve halo em bordas. O AVIF leva de 3,5 a 5 vezes mais tempo na primeira conversão de cada imagem (depois fica em cache) e dobraria o espaço de cache se os dois formatos fossem oferecidos. Medições em contêiner Linux de 4 núcleos, sem GPU; tempos de conversão variam conforme a máquina.

Comparação dos modelos antigos (Etapa 1A): referência fixa de 36 combinações (modelo × segmento × estilo, mais dados do usuário) gravada antes da mudança e idêntica depois; demonstrações de mecânica, ótica e moda idênticas pixel a pixel antes/depois nas 3 larguras (movimento reduzido, sem WebGL); arquivos dos modelos antigos e as 37 imagens/modelo 3D existentes com hash idêntico.

Na Etapa 1A, um teste ponta a ponta antigo (modelo GLB) foi ajustado com autorização: ele criava a Garagem no segmento "furniture", combinação agora recusada; passou a usar "mechanic", sem mudar o que verifica.

Os testes ponta a ponta incluem acessibilidade com axe (WCAG 2 A/AA, sem violações sérias nos 3 modelos), ausência de rolagem horizontal em 390/834/1440 px, movimento reduzido, cena 3D pronta, substituto sem WebGL, carregamento de GLB e segurança da API.

Ambiente de teste sem GPU: as cenas 3D rodam em software (SwiftShader). Por isso os testes do editor simulam navegador sem WebGL, e a cena 3D tem testes próprios.

## Problemas conhecidos

- Desempenho real (Lighthouse/Web Vitals) não medido em aparelhos com GPU.
- O aviso `THREE.Clock: This module has been deprecated` aparece no console do navegador; vem de dentro do React Three Fiber 9.8, não do código do projeto.
- Durante o desenvolvimento, após muitas alterações seguidas, o servidor `next dev` pode entrar em recarregamento contínuo da página de captura; reiniciar o `npm run dev` resolve.
- Modelos GLB com compressão Draco não são carregados (ver README).
- Sem autenticação, sem publicação real, sem IA (por decisão de fase).
- Uploads não são otimizados: o otimizador do Next manteve a versão otimizada acessível depois da exclusão do arquivo e com cache público. Reavaliar na Fase 9 (ver `docs/SEGURANCA.md`).
- Otimizador de imagens no Windows não verificado em máquina real (o `sharp` para Windows x64 está no lockfile como dependência do Next).
- Regressão visual roda só no Linux; no Windows é pulada com aviso.
- Modelos antigos em 834 px e 390 px: o objeto 3D (carro, óculos) sobrepõe parte do título da capa; em 834 px sem WebGL a imagem substituta da ótica aparece cortada na lateral. Já existia antes da Etapa 1A (renderização idêntica).
- Essencial: o cartão na página inicial fica sozinho na segunda linha e sem selo de segmento (`src/app/page.tsx` fora do escopo da 1A); a imagem de prévia mostra o texto da demonstração ("Prestador de serviços") também quando o segmento escolhido é outro; serviços com 4 itens deixam um cartão isolado na grade; a descrição dos serviços repete o nome do serviço ("Orçamento: … solicite um orçamento"); a seção "Sobre" sem foto fica com bastante espaço vazio.
- Loja de móveis deixou de poder usar a cena 3D da Garagem (modelo de outro segmento). A cena de modelo GLB próprio continua existindo; um modelo dedicado de móveis é previsto para a Etapa 4.
- Projetos criados antes da Etapa 1C.1 com o segmento `beauty` aparecem como "Beleza", mesmo os que eram barbearias; o editor ainda não permite trocar o segmento de um projeto existente (o conteúdo gravado não muda).
- No Essencial, a Loja de calçados ainda usa os textos voltados a tênis do pacote `sneakers`, mantido intacto porque a Coleção Editorial depende dele. Textos próprios de calçados virão com o modelo dedicado do segmento.

## Requisitos futuros registrados

- **Gestão de serviços pelo proprietário:** O proprietário do negócio deverá poder **adicionar** serviços, **editar** os existentes, **ativar e desativar** cada serviço e **removê-los**, conforme as regras que o sistema definir. Regra visual e funcional: serviços desativados ou sem conteúdo **não podem gerar cartões vazios, espaços sobrando nem seções sem conteúdo** no site. Não implementado — pertence a uma etapa futura (seção de serviços nova / painel do cliente), com plano próprio.

## Próxima tarefa concreta

1. Aprovação final da **Etapa 1C.1** e autorização de commit.
2. Plano das próximas etapas da 1C, na ordem oficial e intercalando seções e modelos por segmento: primeiro a **Mecânica** (seções de serviços, horário e localização, capa fotográfica, pedido de orçamento; depois o modelo dedicado).
3. Decisões pendentes antes do modelo de Mecânica: fonte das fotografias realistas e veículo sem marca (D2, D3).

Continuam dependendo de decisões do responsável: FASE 8 (provedor de IA, custos) e FASE 9 (projeto Firebase).
