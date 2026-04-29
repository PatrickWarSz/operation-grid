import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Clock, AlertTriangle, DollarSign, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin — Dashboard" }] }),
  component: AdminDashboard,
});

interface Metrics {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  overdue_tenants: number;
  new_tenants_30d: number;
  mrr: number;
  revenue_this_month: number;
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recent, setRecent] = useState<Array<{ id: string; action: string; created_at: string; metadata: any }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const sb = supabase as unknown as { from: (t: string) => any };
      const [{ data: m }, { data: r }] = await Promise.all([
        sb.from("v_admin_metrics").select("*").maybeSingle(),
        sb.from("admin_audit").select("id, action, created_at, metadata").order("created_at", { ascending: false }).limit(10),
      ]);
      setMetrics(m as Metrics | null);
      setRecent((r as any[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-zinc-500 text-sm">carregando métricas...</p>;
  }

  const cards = [
    { label: "Clientes ativos", value: metrics?.active_tenants ?? 0, icon: Users, accent: "text-emerald-400 bg-emerald-500/10" },
    { label: "Em trial", value: metrics?.trial_tenants ?? 0, icon: Clock, accent: "text-blue-400 bg-blue-500/10" },
    { label: "Inadimplentes", value: metrics?.overdue_tenants ?? 0, icon: AlertTriangle, accent: "text-rose-400 bg-rose-500/10" },
    { label: "Novos (30d)", value: metrics?.new_tenants_30d ?? 0, icon: Sparkles, accent: "text-amber-400 bg-amber-500/10" },
    { label: "MRR", value: brl(metrics?.mrr ?? 0), icon: TrendingUp, accent: "text-violet-400 bg-violet-500/10" },
    { label: "Receita do mês", value: brl(metrics?.revenue_this_month ?? 0), icon: DollarSign, accent: "text-teal-400 bg-teal-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Visão geral do sistema.</p>
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
          {recent.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Sem atividade ainda.</p>
          ) : (
            recent.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between text-sm">
                <span className="text-zinc-300">{labelAction(r.action)}</span>
                <span className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleString("pt-BR")}</span>
              </div>
            ))
          )}
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
