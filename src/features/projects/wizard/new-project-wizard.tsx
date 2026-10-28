"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { SegmentId } from "@/domain/business";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/misc";
import { ApiError } from "@/lib/api-client";
import { getTemplate } from "@/features/templates/registry";
import { projectsApi } from "../api";
import { Stepper } from "./stepper";
import { StepBusiness } from "./step-business";
import { StepReview } from "./step-review";
import { StepStyle } from "./step-style";
import { StepTemplate } from "./step-template";
import { useWizardState, validateBusiness, WIZARD_STEPS, type FieldErrors } from "./use-wizard-state";

export function NewProjectWizard({ initialSegment }: { initialSegment?: SegmentId }) {
  const router = useRouter();
  const state = useWizardState(initialSegment);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === state.step);

  function goTo(index: number) {
    const target = WIZARD_STEPS[index];
    if (!target) return;
    state.setStep(target.id);
    topRef.current?.scrollIntoView({ block: "start" });
    topRef.current?.focus();
  }

  function next() {
    if (state.step === "business") {
      const found = validateBusiness(state.business);
      setErrors(found);
      if (Object.keys(found).length > 0) {
        requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
        return;
      }
    }
    if (state.step === "template" && !state.templateId) return;
    goTo(stepIndex + 1);
  }

  async function create() {
    if (!state.templateId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const project = await projectsApi.create({ templateId: state.templateId, style: state.style, business: state.business });
      router.push(`/studio/projects/${project.id}`);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Não foi possível criar o projeto.");
      setSubmitting(false);
    }
  }

  return (
    <div ref={topRef} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <Stepper current={state.step} />

      <div className="animate-fade-in" key={state.step}>
        {state.step === "business" && (
          <StepBusiness business={state.business} errors={errors} onChange={state.setBusiness} onSegmentChange={state.changeSegment} />
        )}
        {state.step === "style" && <StepStyle segment={state.business.segment} value={state.style} onChange={state.setStyle} />}
        {state.step === "template" && (
          <StepTemplate
            segment={state.business.segment}
            recommended={state.recommended}
            others={state.others}
            value={state.templateId}
            style={state.style}
            onChange={state.setTemplateId}
          />
        )}
        {state.step === "review" && (
          <StepReview business={state.business} style={state.style} template={state.templateId ? getTemplate(state.templateId) : undefined} />
        )}
      </div>

      {submitError && (
        <Notice tone="danger" title="Erro ao criar" className="mt-6">
          {submitError}
        </Notice>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 mt-10 flex items-center justify-between gap-3 border-t border-line bg-ink-950/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <Button variant="ghost" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0 || submitting} icon={<ArrowLeft className="size-4" aria-hidden />}>
          Voltar
        </Button>
        <span className="font-mono text-xs text-fg-subtle">
          Etapa {stepIndex + 1} de {WIZARD_STEPS.length}
        </span>
        {state.step === "review" ? (
          <Button variant="primary" onClick={create} disabled={submitting} icon={<Sparkles className="size-4" aria-hidden />}>
            {submitting ? "Criando…" : "Criar site"}
          </Button>
        ) : (
          <Button variant="primary" onClick={next}>
            Continuar <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
