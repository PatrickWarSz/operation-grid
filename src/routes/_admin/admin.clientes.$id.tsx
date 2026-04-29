import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MODULES } from "@/lib/modules";
import { ArrowLeft, Check, X, Clock, Save } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/clientes/$id")({
  head: () => ({ meta: [{ title: "Admin — Cliente" }] }),
  component: ClienteDetail,
});

interface Tenant {
  id: string;
  name: string;
  subscription_status: string;
  trial_ends_at: string | null;
  plan_id: string | null;
  created_at: string;
  asaas_customer_id: string | null;
}
interface Plan {
  id: string;
  slug: string;
  name: string;
  price_monthly: number;
  max_units: number;
}
interface ModuleAccess {
  module_slug: string;
  status: string;
  max_units: number;
}
interface Profile {
  id: string;
  full_name: string | null;
  email?: string;
}

function ClienteDetail() {
  const { id } = Route.useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [access, setAccess] = useState<ModuleAccess[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [unitCount, setUnitCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { void load(); }, [id]);

  async function load() {
    const sb = supabase as unknown as { from: (t: string) => any; rpc: (n: string, a?: any) => any };
    const [{ data: t }, { data: p }, { data: a }, { data: u }, { count: uc }] = await Promise.all([
      sb.from("tenants").select("*").eq("id", id).maybeSingle(),
      sb.from("plans").select("id, slug, name, price_monthly, max_units").eq("active", true).order("price_monthly"),
      sb.from("tenant_module_access").select("module_slug, status, max_units").eq("tenant_id", id),
      sb.from("profiles").select("id, full_name").eq("tenant_id", id),
      sb.from("units").select("*", { count: "exact", head: true }).eq("tenant_id", id),
    ]);
    setTenant(t as Tenant);
    setPlans((p as Plan[]) ?? []);
    setAccess((a as ModuleAccess[]) ?? []);
    setUsers((u as Profile[]) ?? []);
    setUnitCount(uc ?? 0);
  }

  async function setModule(moduleSlug: string, status: "active" | "trial" | "blocked") {
    setBusy(true); setMsg(null);
    const sb = supabase as unknown as { rpc: (n: string, a: any) => any };
    const { error } = await sb.rpc("admin_toggle_module", {
      _tenant: id, _module: moduleSlug, _status: status,
    });
    setBusy(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg(`Módulo ${moduleSlug}${status === "blocked" ? " bloqueado" : " liberado"}.`);
    await load();
  }

  async function setPlan(planId: string) {
    setBusy(true); setMsg(null);
    const sb = supabase as unknown as { rpc: (n: string, a: any) => any };
    const { error } = await sb.rpc("admin_set_plan", { _tenant: id, _plan: planId });
    setBusy(false);
    if (error) { setMsg("Erro: " + error.message); return; }
    setMsg("Plano alterado.");
    await load();
  }

  if (!tenant) return <p className="text-zinc-500 text-sm">carregando...</p>;

  const currentPlan = plans.find((p) => p.id === tenant.plan_id);

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/admin/clientes" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{tenant.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-zinc-400">
          <span>Status: <span className="text-zinc-200">{tenant.subscription_status}</span></span>
          <span>•</span>
          <span>{users.length} {users.length === 1 ? "usuário" : "usuários"}</span>
          <span>•</span>
          <span>{unitCount} {unitCount === 1 ? "filial" : "filiais"}</span>
          <span>•</span>
          <span>Cadastrado {new Date(tenant.created_at).toLocaleDateString("pt-BR")}</span>
        </div>
      </header>

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200">{msg}</div>
      )}

      {/* Plano */}
      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-3">Plano</h2>
        <p className="text-xs text-zinc-400 mb-3">
          Atual: <span className="text-zinc-100 font-medium">{currentPlan?.name ?? "Nenhum"}</span>
          {currentPlan && <> — R$ {currentPlan.price_monthly.toFixed(2)}/mês • {currentPlan.max_units} {currentPlan.max_units === 1 ? "filial" : "filiais"}</>}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              disabled={busy || p.id === tenant.plan_id}
              className={
                "p-3 rounded-lg border text-left transition " +
                (p.id === tenant.plan_id
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700")
              }
            >
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">R$ {p.price_monthly.toFixed(2)}/mês</p>
              <p className="text-[10px] text-zinc-500 mt-1">{p.max_units} {p.max_units === 1 ? "filial" : "filiais"}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-1">Módulos</h2>
        <p className="text-xs text-zinc-400 mb-4">Liberar/bloquear acesso manual.</p>
        <div className="space-y-2">
          {MODULES.map((m) => {
            const a = access.find((x) => x.module_slug === m.id);
            const status = a?.status ?? "blocked";
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{m.short}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <ModuleBtn current={status} target="active"  onClick={() => setModule(m.id, "active")}  busy={busy} icon={Check} label="Ativo" color="emerald" />
                  <ModuleBtn current={status} target="trial"   onClick={() => setModule(m.id, "trial")}   busy={busy} icon={Clock} label="Trial" color="blue" />
                  <ModuleBtn current={status} target="blocked" onClick={() => setModule(m.id, "blocked")} busy={busy} icon={X}     label="Bloqueado" color="rose" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Usuários do tenant */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-3">Usuários ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhum usuário cadastrado.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {users.map((u) => (
              <li key={u.id} className="px-3 py-2 rounded bg-zinc-950 border border-zinc-800">
                {u.full_name ?? <span className="text-zinc-500">(sem nome)</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ModuleBtn({
  current, target, onClick, busy, icon: Icon, label, color,
}: { current: string; target: string; onClick: () => void; busy: boolean; icon: any; label: string; color: "emerald" | "blue" | "rose" }) {
  const active = current === target;
  const base = "px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border transition disabled:opacity-50";
  const colors: Record<string, string> = {
    emerald: active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30",
    blue:    active ? "bg-blue-500/15 text-blue-400 border-blue-500/30"          : "border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30",
    rose:    active ? "bg-rose-500/15 text-rose-400 border-rose-500/30"          : "border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30",
  };
  return (
    <button onClick={onClick} disabled={busy || active} className={base + " " + colors[color]} title={label}>
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
