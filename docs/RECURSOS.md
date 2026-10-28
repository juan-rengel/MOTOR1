# Recursos visuais e licenças

## Recursos demonstrativos (incluídos no projeto)

Todos os arquivos em `public/assets/demo/` foram **gerados por este projeto**:

| Pasta | Origem | Como regenerar |
|---|---|---|
| `mechanic/` | Renderizações da cena 3D procedural do carro | `npm run assets:demo` (com `npm run dev` rodando) |
| `optics/` | Renderizações da cena de óculos (4 formatos de armação) | idem |
| `fashion/` | Renderizações das cenas de tecido e de tênis | idem |
| `models/chair.glb` | Modelo procedural exportado com o `GLTFExporter` do three.js | `npm run assets:model` |

Não há fotos, modelos ou texturas de terceiros. Os enquadramentos ficam em `src/features/scenes3d/demo-shots.ts`; o script `scripts/capture-demo-assets.mjs` abre `/dev/capture` (somente em desenvolvimento), espera a cena ficar pronta e salva JPEG.

As imagens são **ilustrativas**: os sites gerados as marcam como conteúdo demonstrativo, e o editor lembra de substituí-las por fotos reais do negócio.

## Biblioteca e uploads

- Categorias: imagens, vídeos, modelos 3D, logotipos, texturas (ícones e fontes previstos).
- Formatos aceitos: PNG, JPG, WEBP, AVIF, MP4, WEBM, GLB — conferidos pelo conteúdo do arquivo.
- Cada recurso guarda nome, categoria, tipo, tamanho, texto alternativo e licença/origem informados pelo usuário.
- Arquivos ficam em `.data/uploads/` (fora do Git) e são servidos por `/api/assets/<id>/file`.
- URLs externas `https` são permitidas no seletor, com aviso de que podem sair do ar e de que o usuário precisa ter direito de uso.

## Fontes

Pacotes `@fontsource-variable/*` (licença SIL Open Font License): Inter, Manrope, Space Grotesk, Playfair Display, Oswald. Servidas pelo próprio projeto.

## Ícones

`lucide-react` (licença ISC).
