import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { platformConfig } from "@/config/platform";

export const metadata: Metadata = {
  title: {
    default: platformConfig.name,
    template: `%s · ${platformConfig.name}`,
  },
  description: platformConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#06080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script de movimento das páginas de site adiciona uma classe
    // em <html> antes da hidratação (ver features/animations/site-motion-script.ts).
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
