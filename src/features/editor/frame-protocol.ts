import { z } from "zod";
import { projectSchema } from "@/domain/project";

/**
 * Protocolo de mensagens entre o editor (janela pai) e a pré-visualização (iframe).
 * Ambos os lados verificam a origem e validam o formato das mensagens.
 */
export const toFrameMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("cws:render"),
    project: projectSchema,
    selectedSectionId: z.string().nullable(),
    motionDisabled: z.boolean(),
  }),
  z.object({ type: z.literal("cws:scroll-to"), sectionId: z.string() }),
]);
export type ToFrameMessage = z.infer<typeof toFrameMessageSchema>;

export const fromFrameMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("cws:ready") }),
  z.object({ type: z.literal("cws:select"), sectionId: z.string() }),
  z.object({ type: z.literal("cws:invalid"), message: z.string() }),
]);
export type FromFrameMessage = z.infer<typeof fromFrameMessageSchema>;
