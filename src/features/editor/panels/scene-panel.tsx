"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import type { Project } from "@/domain/project";
import type { SceneSettings } from "@/domain/scene";
import { SCENE_LIST, SCENES } from "@/features/scenes3d/registry";
import { AssetPickerDialog } from "@/features/assets/asset-picker-dialog";
import { Button } from "@/components/ui/button";
import { Field, Select, Toggle } from "@/components/ui/field";
import { Notice } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { ImageField } from "../fields/media-field";
import { updateScene, type EditorAction } from "../editor-state";

export function ScenePanel({ project, dispatch, onAddStory }: { project: Project; dispatch: (a: EditorAction) => void; onAddStory: () => void }) {
  const s = project.scene;
  const [modelPicker, setModelPicker] = useState(false);
  const set = (patch: Partial<SceneSettings>, key: string | null) => dispatch({ type: "edit", key: key && `scene.${key}`, apply: updateScene(patch) });
  const hasStory = project.sections.some((x) => x.type === "sceneStory");
  const def = SCENES[s.sceneId];

  return (
    <div className="space-y-6">
      {!hasStory && (
        <Notice tone="warn" title="Nenhuma seção usa a cena 3D">
          A cena aparece na seção “História 3D”.
          <Button size="sm" className="mt-3" onClick={onAddStory} icon={<Box className="size-3.5" aria-hidden />}>
            Adicionar seção História 3D
          </Button>
        </Notice>
      )}
      <Toggle label="Cena 3D ativada" description="Desativada, a seção usa a imagem substituta." checked={s.enabled} onChange={(v) => set({ enabled: v }, null)} />
      <div className={cn("space-y-6", !s.enabled && "opacity-50")}>
        <div role="radiogroup" aria-label="Cena" className="grid gap-2">
          {SCENE_LIST.map((scene) => (
            <button
              key={scene.id}
              type="button"
              role="radio"
              aria-checked={s.sceneId === scene.id}
              onClick={() => set({ sceneId: scene.id }, null)}
              className={cn("rounded-lg border px-3 py-2.5 text-left transition-colors", s.sceneId === scene.id ? "border-cyan-glow bg-cyan-glow/10" : "border-line hover:border-line-strong")}
            >
              <span className="block text-sm text-fg">{scene.label}</span>
              <span className="block text-xs text-fg-subtle">{scene.description}</span>
            </button>
          ))}
        </div>
        {def.requiresModel && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-fg-muted">Modelo GLB</p>
            <p className="truncate font-mono text-[11px] text-fg-subtle">{s.modelSrc || "Nenhum modelo selecionado"}</p>
            <Button size="sm" onClick={() => setModelPicker(true)}>
              {s.modelSrc ? "Trocar modelo" : "Escolher modelo"}
            </Button>
            <AssetPickerDialog
              open={modelPicker}
              kind="model"
              onClose={() => setModelPicker(false)}
              onPick={(asset) => {
                set({ modelSrc: asset.src }, null);
                setModelPicker(false);
              }}
            />
          </div>
        )}
        {def.variants && (
          <Field label="Variação">
            {(a) => (
              <Select id={a.id} value={s.variant || def.variants![0]!.id} onChange={(e) => set({ variant: e.target.value }, null)}>
                {def.variants!.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )}
        <Field label="Movimento de câmera">
          {(a) => (
            <Select id={a.id} value={s.cameraMotion} onChange={(e) => set({ cameraMotion: e.target.value as SceneSettings["cameraMotion"] }, null)}>
              <option value="scroll">Acompanha a rolagem (momentos: {def.cameraMoments.join(" → ")})</option>
              <option value="orbit">Giro lento contínuo</option>
              <option value="static">Fixa</option>
            </Select>
          )}
        </Field>
        <Toggle label="Interação com o mouse" description="Leve inclinação da câmera seguindo o ponteiro." checked={s.interactive} onChange={(v) => set({ interactive: v }, null)} />
        <Field label="Qualidade" hint="Automática: ajusta resolução, sombras e reflexos ao aparelho do visitante.">
          {(a) => (
            <Select id={a.id} aria-describedby={a.describedBy} value={s.quality} onChange={(e) => set({ quality: e.target.value as SceneSettings["quality"] }, null)}>
              <option value="auto">Automática (recomendado)</option>
              <option value="high">Alta (reflexos e sombras)</option>
              <option value="low">Leve</option>
            </Select>
          )}
        </Field>
        <Field label="Ambiente de luz">
          {(a) => (
            <Select id={a.id} value={s.environment} onChange={(e) => set({ environment: e.target.value as SceneSettings["environment"] }, null)}>
              <option value="studio">Estúdio neutro</option>
              <option value="night">Noturno (frio)</option>
              <option value="warm">Quente</option>
            </Select>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-fg-muted">
            Cor do objeto
            <input type="color" value={s.primaryColor} onChange={(e) => set({ primaryColor: e.target.value }, "c1")} className="mt-1 block h-9 w-full cursor-pointer rounded border border-line bg-transparent" />
          </label>
          <label className="text-xs text-fg-muted">
            Cor das luzes de destaque
            <input type="color" value={s.accentColor} onChange={(e) => set({ accentColor: e.target.value }, "c2")} className="mt-1 block h-9 w-full cursor-pointer rounded border border-line bg-transparent" />
          </label>
        </div>
      </div>
      <ImageField label="Imagem substituta (sem 3D, carregando ou em aparelhos fracos)" value={s.fallbackImage} onChange={(img, sub) => set({ fallbackImage: img }, sub ? `fb.${sub}` : null)} />
    </div>
  );
}
