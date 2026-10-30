---
name: novo-modelo-segmento
description: Procedimento para criar um modelo (template) exclusivo para um segmento comercial do MOTOR1 — pesquisa do segmento, plano para aprovação, estrutura própria, textos honestos, mídia licenciada, cena 3D opcional, testes e capturas. Use quando pedirem um modelo novo, um modelo para um segmento sem modelo dedicado, ou a separação de um modelo compartilhado.
---

# Novo modelo exclusivo de segmento

Um modelo **exclusivo** não é um modelo existente com outro texto. Ele precisa de estrutura, ritmo visual, mídia e chamada para ação pensados para o segmento. Este procedimento tem duas fases: **plano (aguarda aprovação)** e **implementação**.

## Fase 1 — Plano (nenhum arquivo é alterado)

1. **Leia o estado atual**
   - `src/config/segments.ts` (segmento, objetivo padrão, estilos sugeridos, sugestões de oferta).
   - `src/features/templates/registry.ts` e os modelos existentes (`mechanic.ts`, `optics.ts`, `fashion.ts`) como referência de formato — **não os altere**.
   - `src/features/content/copy-packs.ts` (o segmento tem pacote próprio ou usa o genérico?).
   - `src/domain/sections.ts` (tipos de seção disponíveis) e `docs/STATUS.md`.
2. **Defina o perfil do segmento** (escreva no plano):
   - Objetivo de conversão principal (WhatsApp, agendamento, orçamento, catálogo, contato).
   - O que o visitante precisa ver para confiar (ex.: advocacia → áreas de atuação, quem atende, como funciona a consulta; restaurante → cardápio, horário, localização).
   - Tom visual (sóbrio, enérgico, editorial, acolhedor) e se **3D faz sentido**. Segmentos de confiança (advocacia, saúde) normalmente pedem movimento contido e sem cena 3D; 3D só quando houver um objeto protagonista (produto, ambiente).
3. **Proponha a estrutura** em uma tabela: ordem das seções, tipo de cada uma, variação, conteúdo inicial e fonte do conteúdo (dados do negócio / texto demonstrativo / imagem com origem X).
   - O modelo deve diferir dos existentes em **composição** (abertura, ordem, densidade, layout das seções), não só em cores.
   - Se faltar um tipo de seção (cardápio, equipe, planos, horário…), liste-o como dependência — criar seção nova é outra etapa e precisa de aprovação própria.
4. **Mídia**: liste cada imagem/vídeo/modelo necessário e como será obtido (cena 3D própria, foto fornecida pelo cliente, banco licenciado — este último pode ter custo e exige autorização). Siga a skill `recursos-demo`.
5. **Arquivos afetados**, riscos e plano de verificação. Liste também os **efeitos em comportamento existente**, por exemplo:
   - criar um pacote de textos para um segmento que hoje usa o genérico (`copy-packs.ts`) muda o texto inicial de projetos novos desse segmento criados com **qualquer** modelo, inclusive os adaptados;
   - adicionar um id em `SCENE_IDS` ou um modelo no registro muda as opções exibidas no assistente e no editor;
   - a atualização de `docs/STATUS.md`, `docs/ARQUITETURA.md` e `docs/RECURSOS.md` (também precisa de aprovação).
6. **Apresente o plano e aguarde aprovação.**

## Fase 2 — Implementação (somente após aprovação)

1. **Arquivo do modelo**: `src/features/templates/<segmento>.ts` exportando um `TemplateDefinition` (`types.ts`):
   - `id` em kebab-case, estável (é gravado nos projetos e usado em `/demo/<id>`). Nunca renomeie o id de um modelo publicado.
   - `segments`: apenas os segmentos para os quais foi desenhado.
   - `defaultStyle` entre os `suggestedStyles` do segmento; `themeTweaks` só quando melhorar a identidade (conferir contraste).
   - `scene(ctx)`: cena coerente com o segmento, ou `enabled: false` quando o modelo não usa 3D.
   - `buildSections(ctx)`: use `createSection` e `withIds` (`src/features/sections/create-section.ts`). Use os dados do negócio quando informados (`ctx.business`) e os textos de `ctx.copy`.
   - Âncoras únicas (o schema do projeto rejeita repetidas) e `navLabel` curtos.
   - **Não fixe no código** textos de outro segmento.
   - `demoBusiness`: negócio claramente fictício, como nos modelos existentes: telefone, WhatsApp, e-mail e endereço **vazios** (não invente contatos).
2. **Registro**: adicionar ao array `TEMPLATES` em `registry.ts` (sem remover nem reordenar os existentes).
3. **Textos**: se o segmento usa o pacote genérico, criar o pacote em `copy-packs.ts` com textos neutros e verdadeiros para qualquer negócio do segmento.
4. **Cena 3D (se aprovada)**: `src/features/scenes3d/scenes/<cena>/`, registro em `registry.ts` e `lazy-scenes.ts`, `SCENE_IDS` em `src/domain/scene.ts`, enquadramentos em `demo-shots.ts`. Requisitos: carregar sob demanda, pausar fora da tela, `dispose` de geometrias/materiais criados fora do JSX, imagem substituta, desempenho aceitável no nível "medium".
5. **Testes**:
   - Unitário (padrão de `tests/unit/template-variants.test.ts`): o projeto criado passa em `projectSchema`, usa a cena esperada, aproveita os dados do negócio e não contém textos de outros segmentos.
   - Ponta a ponta: incluir o id em `TEMPLATE_IDS` de `tests/e2e/sites.spec.ts` (carregamento sem erros, sem rolagem horizontal em 390/834/1440, axe sem violações sérias).
6. **Documentação**: tabela de modelos em `docs/ARQUITETURA.md`, recursos em `docs/RECURSOS.md`, situação em `docs/STATUS.md`.

## Critérios de qualidade (todos obrigatórios)

- [ ] Estrutura reconhecivelmente diferente dos outros modelos (comparar capturas lado a lado).
- [ ] Nenhuma afirmação inventada: sem depoimentos, avaliações, notas, prêmios, certificações, anos de mercado, número de clientes, preços ou garantias. Preço só "Sob consulta" ou vazio.
- [ ] Conteúdo demonstrativo marcado (`flags.demoContent`) e substituível pelo editor.
- [ ] Chamada principal coerente com o objetivo do segmento e funcional (WhatsApp só com número válido; sem destino → alerta no editor).
- [ ] Toda imagem com texto alternativo descritivo e origem/licença registradas.
- [ ] Contraste AA do texto e dos botões em todos os estilos sugeridos.
- [ ] Movimento reduzido: todo o conteúdo visível sem animação.
- [ ] Sem WebGL: imagem substituta aparece e o layout não quebra.
- [ ] Editável: cada seção abre no painel com os campos esperados.

## Verificação

Execute a skill `verificar` (tipos, lint, unitários, build, ponta a ponta) e depois a `revisao-visual` para o novo modelo em `/demo/<id>`. Relate os resultados reais; se algo não pôde ser executado, diga isso.
