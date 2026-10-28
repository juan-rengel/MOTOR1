import { z } from "zod";

export const MOTION_LEVELS = ["none", "subtle", "balanced", "cinematic"] as const;
export const motionLevelSchema = z.enum(MOTION_LEVELS);
export type MotionLevel = z.infer<typeof motionLevelSchema>;

export const motionSchema = z.object({
  level: motionLevelSchema,
  textReveal: z.boolean(),
  imageReveal: z.boolean(),
  parallax: z.boolean(),
  sectionTransitions: z.boolean(),
});
export type MotionSettings = z.infer<typeof motionSchema>;
