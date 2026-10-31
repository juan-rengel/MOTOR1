import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança aplicados a todas as rotas.
 * - frame-ancestors 'self': o editor incorpora a pré-visualização via iframe da
 *   própria origem; nenhum site externo pode incorporar a plataforma.
 * - nosniff: impede que o navegador "adivinhe" tipos de arquivo (importante
 *   para uploads servidos pela rota de recursos).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  /**
   * Otimizador de imagens nativo (sem dependência nova). Só otimiza as imagens de
   * demonstração (/assets/demo, sem query string); qualquer outro caminho recebe 400.
   *
   * Uploads (/api/assets/<id>/file) NÃO passam pelo otimizador: as versões otimizadas
   * ficam em cache e continuariam acessíveis depois que o arquivo fosse excluído
   * (verificado na Etapa 1B). A otimização segura dos uploads será reavaliada na
   * Fase 9, junto com o armazenamento em nuvem. URLs externas também não passam aqui.
   */
  images: {
    localPatterns: [{ pathname: "/assets/demo/**", search: "" }],
    formats: ["image/webp"],
    qualities: [75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Arquivos enviados: nunca interpretados como página (a última regra prevalece).
      {
        source: "/api/assets/:id/file",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; sandbox; frame-ancestors 'self'" }],
      },
    ];
  },
};

export default nextConfig;
