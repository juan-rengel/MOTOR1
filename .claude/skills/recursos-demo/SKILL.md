---
name: recursos-demo
description: Gerar, obter e registrar imagens, vídeos, texturas e modelos 3D usados nos modelos e demonstrações do MOTOR1, com origem e licença verificadas, otimização e registro em docs/RECURSOS.md. Use sempre que um modelo, seção ou cena precisar de mídia nova, ao trocar imagens de demonstração ou ao avaliar se uma mídia pode ser usada.
---

# Recursos de demonstração

Regra central: **nenhuma mídia entra no projeto sem origem e licença verificadas e registradas.** Na dúvida, não use.

## Fontes permitidas, em ordem de preferência

1. **Gerada pelo próprio projeto** (sem licença de terceiros):
   - Imagens a partir das cenas 3D: enquadramentos em `src/features/scenes3d/demo-shots.ts`; com `npm run dev` rodando, `npm run assets:demo -- <id> <id>`, **sempre com os ids dos enquadramentos novos**. Saída em JPEG no caminho `file` do enquadramento, dentro de `public/`.
   - Modelo GLB demonstrativo: `npm run assets:model` (`scripts/generate-demo-model.mjs`).

> **Proteção dos recursos existentes.** `npm run assets:demo` sem ids regenera **todas** as imagens e sobrescreve as dos modelos atuais (`public/assets/demo/mechanic`, `optics`, `fashion`); `npm run assets:model` sobrescreve `public/assets/demo/models/chair.glb`. Por isso:
> - `npm run assets:demo` sem ids está bloqueado em `.claude/settings.json` — não tente contornar (ex.: chamando o script com `node`).
> - Gerar mídia, inclusive com ids, só com **plano aprovado** que liste os ids e os arquivos de saída.
> - Antes de gerar, confira que o caminho `file` de cada id novo **não existe** ainda; um enquadramento novo nunca aponta para arquivo de modelo existente.
> - Depois de gerar, confirme com `git status public/assets/demo` que nenhum arquivo existente aparece como modificado. Se aparecer, pare e informe.
> - Substituir uma imagem existente é alteração de modelo existente: exige plano próprio e aprovação explícita.
2. **Fornecida pelo cliente** para o site dele: entra pela biblioteca do Studio (upload), que registra licença/origem e texto alternativo. Não vai para `public/assets/demo/`.
3. **Banco de imagens ou criador externo**: somente com **autorização prévia do responsável** (pode haver custo) e licença que permita uso comercial em sites de terceiros, sem atribuição obrigatória ou com atribuição viável. Guarde a URL da página da licença e do item.
4. **Imagens geradas por IA externa**: somente com autorização (custo) e após conferir os termos de uso comercial do serviço.

**Proibido:**
- hotlink de imagens de terceiros;
- imagens de buscadores sem licença identificada;
- fotos de pessoas reais sem autorização de uso de imagem;
- logotipos ou marcas de terceiros (inclusive em produtos 3D);
- imagens que sugiram resultados, clientes ou depoimentos reais.

## Requisitos técnicos

| Tipo | Formato | Dimensão / tamanho |
|---|---|---|
| Foto de capa / fundo | JPEG (qualidade ~82) ou WebP/AVIF | até 1600–1920 px no lado maior; alvo < 300 KB |
| Imagem de cartão / galeria | JPEG/WebP | 900–1200 px; alvo < 180 KB |
| Modelo 3D | GLB **sem compressão Draco** (não suportada) | alvo < 5 MB; centralizado, escala em metros, texturas ≤ 2048 px |
| Vídeo | MP4 (H.264) e/ou WebM, sem áudio para fundo | 720–1080p; alvo < 8 MB; com imagem de pôster |

- Nomes em kebab-case, descritivos, sem espaços nem acentos (`frame-round-navy.jpg`).
- Pasta por modelo/segmento: `public/assets/demo/<segmento>/`.
- Todo uso no código tem `alt` descritivo (o que aparece, não "imagem de…"). Imagem decorativa: `alt=""`.
- Coerência com o segmento: nada de imagem de carro em clínica, etc.

## Procedimento

1. Liste as mídias necessárias (onde serão usadas, proporção, assunto, caminho de saída).
2. Para cada uma, escolha a fonte permitida e — se for externa ou paga — **peça autorização antes**.
3. Inclua a lista no plano da etapa e **aguarde aprovação** antes de gerar, baixar ou copiar qualquer arquivo.
4. Gere ou obtenha a mídia; confira dimensões e peso (`ls -l`, ou leitura da imagem para inspeção visual).
5. Abra cada imagem e confira: nitidez, enquadramento, ausência de marcas/logotipos/pessoas não autorizadas, coerência com o segmento.
6. Confirme que nenhum recurso existente foi modificado (`git status public/assets/demo`).
7. **Registre em `docs/RECURSOS.md`**: arquivo/pasta, origem, licença (com link quando externa), data, como regenerar.
8. Rode a skill `verificar` e, para mudanças visíveis, a `revisao-visual`.

## Critérios de aceite

- [ ] Origem e licença registradas em `docs/RECURSOS.md` para cada arquivo novo.
- [ ] Nenhum custo assumido sem autorização.
- [ ] Nenhuma imagem ou modelo existente sobrescrito (`git status public/assets/demo` sem arquivos modificados).
- [ ] Peso e dimensões dentro dos alvos (ou exceção justificada).
- [ ] `alt` descritivo em todos os usos.
- [ ] Conteúdo demonstrativo continua sinalizado no site e no editor.
- [ ] Repositório sem arquivos órfãos (mídia gerada e não usada é removida antes do commit, com confirmação).
