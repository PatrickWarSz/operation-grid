import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingUp, Clock, AlertTriangle, DollarSign, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin — Dashboard" }] }),
  component: AdminDashboard,
});

// MOCK: métricas e atividade recente fictícias.
const MOCK_METRICS = {
  total_tenants: 142,
  active_tenants: 98,
  trial_tenants: 24,
  overdue_tenants: 7,
  new_tenants_30d: 18,
  mrr: 47820.5,
  revenue_this_month: 51240.8,
};

const MOCK_RECENT = [
  { id: "1", action: "plan_changed", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), metadata: {} },
  { id: "2", action: "module_active", created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), metadata: {} },
  { id: "3", action: "module_trial", created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), metadata: {} },
  { id: "4", action: "tenant_cancelled", created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), metadata: {} },
  { id: "5", action: "module_blocked", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), metadata: {} },
];

function AdminDashboard() {
  const metrics = MOCK_METRICS;
  const recent = MOCK_RECENT;

  const cards = [
    { label: "Clientes ativos", value: metrics.active_tenants, icon: Users, accent: "text-emerald-400 bg-emerald-500/10" },
    { label: "Em trial", value: metrics.trial_tenants, icon: Clock, accent: "text-blue-400 bg-blue-500/10" },
    { label: "Inadimplentes", value: metrics.overdue_tenants, icon: AlertTriangle, accent: "text-rose-400 bg-rose-500/10" },
    { label: "Novos (30d)", value: metrics.new_tenants_30d, icon: Sparkles, accent: "text-amber-400 bg-amber-500/10" },
    { label: "MRR", value: brl(metrics.mrr), icon: TrendingUp, accent: "text-violet-400 bg-violet-500/10" },
    { label: "Receita do mês", value: brl(metrics.revenue_this_month), icon: DollarSign, accent: "text-teal-400 bg-teal-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Visão geral do sistema (dados fictícios).</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className={"inline-flex items-center justify-center h-9 w-9 rounded-lg " + c.accent}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-zinc-400 mt-3">{c.label}</p>
              <p className="text-2xl font-semibold mt-1">{c.value}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Atividade recente</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
          {recent.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between text-sm">
              <span className="text-zinc-300">{labelAction(r.action)}</span>
              <span className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
function labelAction(a: string) {
  const map: Record<string, string> = {
    plan_changed: "Plano alterado",
    module_active: "Módulo ativado",
    module_trial: "Trial liberado",
    module_blocked: "Módulo bloqueado",
    tenant_cancelled: "Cliente cancelado",
  };
  return map[a] ?? a;
}
