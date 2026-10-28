import { SEGMENTS } from "./segments";
import { VISUAL_STYLES } from "./styles";
import type { SegmentId } from "@/domain/business";
import type { VisualStyleId } from "@/domain/theme";

export const segmentLabel = (id: SegmentId) => SEGMENTS.find((s) => s.id === id)?.label ?? id;
export const styleLabel = (id: VisualStyleId) => VISUAL_STYLES[id]?.label ?? id;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
export const formatDateTime = (iso: string) => dateFormatter.format(new Date(iso));
