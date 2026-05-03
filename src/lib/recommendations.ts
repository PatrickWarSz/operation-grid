// Recomendações de módulos por segmento (estado vazio inteligente).
import type { AppModule } from "@/lib/modules";

export const SEGMENTS = [
  { id: "varejo", label: "Varejo / E-commerce" },
  { id: "industria", label: "Indústria / Produção" },
  { id: "servicos", label: "Serviços" },
  { id: "outro", label: "Outro" },
] as const;

export const COMPANY_SIZES = [
  { id: "solo", label: "Sou eu sozinho(a)" },
  { id: "2-5", label: "2 a 5 pessoas" },
  { id: "6-20", label: "6 a 20 pessoas" },
  { id: "21+", label: "Mais de 20 pessoas" },
] as const;

export const PAINS = [
  { id: "devolucoes", label: "Devoluções e disputas atrapalhando margem" },
  { id: "estoque", label: "Estoque desorganizado / falta de matéria-prima" },
  { id: "tudo", label: "Quero organizar tudo de uma vez" },
] as const;

const BY_SEGMENT: Record<string, string[]> = {
  varejo: ["estoque", "devolucoes"],
  industria: ["estoque"],
  servicos: ["devolucoes"],
  outro: ["devolucoes", "estoque"],
};

const BY_PAIN: Record<string, string[]> = {
  devolucoes: ["devolucoes"],
  estoque: ["estoque"],
  tudo: ["devolucoes", "estoque"],
};

export function recommendedModuleIds(opts: { segment?: string | null; pain?: string | null }): string[] {
  const ids = new Set<string>();
  if (opts.pain && BY_PAIN[opts.pain]) BY_PAIN[opts.pain].forEach((m) => ids.add(m));
  if (opts.segment && BY_SEGMENT[opts.segment]) BY_SEGMENT[opts.segment].forEach((m) => ids.add(m));
  if (ids.size === 0) ["devolucoes", "estoque"].forEach((m) => ids.add(m));
  return Array.from(ids).slice(0, 3);
}

export function pickRecommended(modules: AppModule[], ids: string[]): AppModule[] {
  const map = new Map(modules.map((m) => [m.id, m]));
  return ids.map((i) => map.get(i)).filter((m): m is AppModule => !!m && m.status === "available");
}
