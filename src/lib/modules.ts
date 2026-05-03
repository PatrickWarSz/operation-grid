import { PackageOpen, Boxes, type LucideIcon } from "lucide-react";

export type ModuleStatus = "available" | "coming_soon";

export type AppModule = {
  id: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  status: ModuleStatus;
  /** Suggested monthly price in BRL */
  price: number;
  accent?: string;
  /** URL externa do app satélite (workspace do programa). */
  externalUrl?: string;
  /** URL da landing pública. */
  landingUrl?: string;
};

export const MODULES: AppModule[] = [
  {
    id: "devolucoes",
    name: "Devoluções Pro",
    short: "Disputas, prazos e reembolsos sob controle.",
    description:
      "Centralize todas as devoluções e disputas em um único painel. Acompanhe prazos, automatize respostas e proteja sua margem.",
    features: [
      "Dashboard com status em tempo real",
      "Gestão de disputas e prazos",
      "Histórico completo por pedido",
      "Relatórios de perda e recuperação",
    ],
    icon: PackageOpen,
    status: "available",
    price: 149,
  },
  {
    id: "estoque",
    name: "Estoque Pro",
    short: "Controle de estoque e pedidos de matéria-prima.",
    description:
      "Aviamentos, linha, tecido, embalagem, etiquetas e tags sob controle. Pedidos de reposição inteligentes pra manter o giro sem faltar nem sobrar.",
    features: [
      "Controle de matéria-prima",
      "Pedidos de compra automatizados",
      "Alertas de estoque mínimo",
      "Movimentações e auditoria",
    ],
    icon: Boxes,
    status: "available",
    price: 149,
  },
];

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Para começar com o essencial.",
    price: 199,
    badge: null as string | null,
    includes: ["devolucoes"],
    maxUnits: 1,
    features: [
      "1 programa à escolha",
      "Até 3 usuários",
      "1 filial (matriz)",
      "Suporte por e-mail",
      "Atualizações globais",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Para quem está escalando.",
    price: 549,
    badge: "Mais popular",
    includes: ["devolucoes", "estoque", "financeiro-empresa"],
    maxUnits: 3,
    features: [
      "3 programas inclusos",
      "Até 10 usuários",
      "Até 3 filiais",
      "White-label básico",
      "Suporte prioritário",
      "Feature flags por solicitação",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Operação completa, sob medida.",
    price: 1290,
    badge: null,
    includes: MODULES.filter((m) => m.status === "available").map((m) => m.id),
    maxUnits: null as number | null, // ilimitado
    features: [
      "Todos os programas disponíveis",
      "Usuários ilimitados",
      "Filiais ilimitadas",
      "White-label completo",
      "SLA dedicado",
      "Customizações por cliente",
    ],
  },
];
