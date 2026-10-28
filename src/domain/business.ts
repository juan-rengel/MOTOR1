import { z } from "zod";

export const SEGMENT_IDS = [
  "mechanic",
  "law",
  "dental",
  "optics",
  "fashion",
  "sneakers",
  "furniture",
  "gym",
  "beauty",
  "restaurant",
  "services",
  "other",
] as const;
export const segmentIdSchema = z.enum(SEGMENT_IDS);
export type SegmentId = z.infer<typeof segmentIdSchema>;

export const GOAL_IDS = ["whatsapp", "quote", "booking", "catalog", "contact", "awareness"] as const;
export const goalSchema = z.enum(GOAL_IDS);
export type BusinessGoal = z.infer<typeof goalSchema>;

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido.");

/** Telefones: permite dígitos, espaços, parênteses, + e hífen. Validação de formato fica em lib/phone. */
const phoneText = z
  .string()
  .trim()
  .max(30)
  .refine((v) => /^[0-9+()\-\s.]*$/.test(v), "Use apenas números e os símbolos + ( ) -.");

export const socialLinksSchema = z.object({
  instagram: z.string().trim().max(200),
  facebook: z.string().trim().max(200),
  tiktok: z.string().trim().max(200),
  youtube: z.string().trim().max(200),
  linkedin: z.string().trim().max(200),
  website: z.string().trim().max(200),
});
export type SocialLinks = z.infer<typeof socialLinksSchema>;
export type SocialNetwork = keyof SocialLinks;

export const businessSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome comercial.").max(80),
  segment: segmentIdSchema,
  city: z.string().trim().max(80),
  description: z.string().trim().max(600),
  offerings: z.array(z.string().trim().min(1).max(80)).max(12),
  audience: z.string().trim().max(200),
  phone: phoneText,
  whatsapp: phoneText,
  email: optionalEmail,
  address: z.string().trim().max(200),
  hours: z.string().trim().max(200),
  social: socialLinksSchema,
  goal: goalSchema,
});
export type BusinessInfo = z.infer<typeof businessSchema>;

export const emptySocialLinks = (): SocialLinks => ({
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  linkedin: "",
  website: "",
});
