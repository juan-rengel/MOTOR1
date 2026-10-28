import { platformConfig } from "@/config/platform";

export default function HomePage() {
  return (
    <main className="studio-grid flex min-h-screen items-center justify-center p-8">
      <h1 className="font-display text-4xl font-semibold">{platformConfig.name}</h1>
    </main>
  );
}
