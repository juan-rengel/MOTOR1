"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: (error: Error) => ReactNode;
  children: ReactNode;
  resetKey?: string;
}

/** Captura falhas da cena 3D (shader, modelo inválido, contexto perdido) e mostra o substituto. */
export class SceneErrorBoundary extends Component<Props, { error: Error | null; key?: string }> {
  override state: { error: Error | null; key?: string } = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: { error: Error | null; key?: string }) {
    if (props.resetKey !== state.key) return { error: null, key: props.resetKey };
    return null;
  }

  override componentDidCatch(error: Error) {
    console.warn("[cena 3D] Falha ao renderizar:", error.message);
  }

  override render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children;
  }
}
