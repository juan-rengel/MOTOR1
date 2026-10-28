import type { Metadata } from "next";
import { FrameClient } from "./frame-client";

export const metadata: Metadata = { title: "Pré-visualização do editor", robots: { index: false, follow: false } };

export default function FramePage() {
  return <FrameClient />;
}
