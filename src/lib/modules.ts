import {
  PackageOpen,
  Boxes,
  Wallet,
  PiggyBank,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type ModuleStatus = "available" | "coming_soon";

export type AppModule = {
  id: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  status: ModuleStatus;
  /** Suggested monthly price in BRL for the "build your own" calculator */
  price: number;
  accent?: string;
  /**
   * URL pública pra abrir o app satélite (workspace do programa).
   * Quando definida, o card do workspace abre em nova guia com handoff de sessão
   * em vez de renderizar /apps/<slug> em iframe interno.
   */
  externalUrl?: string;
  /** URL da landing pública do programa (fora do Hub). */
  landingUrl?: string;
};

export const MODULES: AppModule[] = [
  {
    id: "devolucoes",
    name: "Controle de Devoluções",
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
    short: "Controle de matéria-prima para fabricantes têxteis.",
    description:
      "Aviamentos, linha, tecido, embalagem, etiquetas e tags sob controle. Pedidos de reposição inteligentes pra manter o giro sem faltar nem sobrar.",
    features: [
      "Controle de matéria-prima têxtil",
      "Pedidos de compra automatizados",
      "Alertas de estoque mínimo",
      "Movimentações e auditoria",
    ],
    icon: Boxes,
    status: "available",
    price: 49,
    externalUrl: "https://estoquemat.lovable.app/app/estoque",
    landingUrl: "https://estoquemat.lovable.app/",
  },
  {
    id: "financeiro-empresa",
    name: "Gestão Financeira Empresarial",
    short: "Fluxo de caixa, contas e DRE em tempo real.",
    description:
      "Receita, despesa, fluxo de caixa e DRE consolidados. Tome decisões com base em números, não em achismo.",
    features: [
      "Contas a pagar e receber",
      "Fluxo de caixa projetado",
      "DRE e relatórios gerenciais",
      "Conciliação bancária",
    ],
    icon: Wallet,
    status: "available",
    price: 249,
  },
  {
    id: "financeiro-pessoal",
    name: "Controle Financeiro Pessoal",
    short: "Suas finanças e da equipe, organizadas.",
    description:
      "Para sócios, diretoria e colaboradores: controle de gastos pessoais, metas e investimentos sem misturar com o caixa da empresa.",
    features: [
      "Categorias e metas mensais",
      "Importação de extratos",
      "Cartões e investimentos",
      "Relatórios pessoais privados",
    ],
    icon: PiggyBank,
    status: "available",
    price: 49,
  },
  {
    id: "vendas",
    name: "Vendas & PDV",
    short: "Pedidos, clientes e canais em um só lugar.",
    description: "Em desenvolvimento — gestão de vendas multi-canal com integração nativa.",
    features: [
      "Pedidos multi-canal",
      "Catálogo unificado",
      "Comissões automáticas",
      "Integrações com marketplaces",
    ],
    icon: ShoppingCart,
    status: "coming_soon",
    price: 199,
  },
  {
    id: "crm",
    name: "CRM & Atendimento",
    short: "Funil de clientes e relacionamento.",
    description: "Em desenvolvimento — funil de vendas, atendimento e histórico unificado.",
    features: ["Funil de oportunidades", "Histórico do cliente", "Tarefas e follow-ups", "Integração com WhatsApp"],
    icon: Users,
    status: "coming_soon",
    price: 179,
  },
  {
    id: "bi",
    name: "Relatórios & BI",
    short: "Dashboards executivos cross-módulos.",
    description: "Em desenvolvimento — visão consolidada de toda sua operação em painéis configuráveis.",
    features: ["Dashboards configuráveis", "Cross-módulos", "Exportações agendadas", "Compartilhamento seguro"],
    icon: BarChart3,
    status: "coming_soon",
    price: 129,
  },
  {
    id: "fiscal",
    name: "Notas Fiscais",
    short: "Emissão e gestão fiscal integrada.",
    description: "Em desenvolvimento — emissão de NF-e/NFC-e direto do hub.",
    features: ["Emissão automática", "Gestão de impostos", "Histórico e cancelamentos", "Integração contábil"],
    icon: FileText,
    status: "coming_soon",
    price: 159,
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
    features: [
      "1 programa à escolha",
      "Até 3 usuários",
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
    features: [
      "3 programas inclusos",
      "Até 10 usuários",
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
    features: [
      "Todos os programas disponíveis",
      "Usuários ilimitados",
      "White-label completo",
      "SLA dedicado",
      "Customizações por cliente",
    ],
  },
];
