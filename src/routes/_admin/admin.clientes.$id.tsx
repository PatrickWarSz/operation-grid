import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MODULES } from "@/lib/modules";
import { ArrowLeft, Check, X, Clock } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/clientes/$id")({
  head: () => ({ meta: [{ title: "Admin — Cliente" }] }),
  component: ClienteDetail,
});

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_monthly: number;
  max_units: number;
}

const MOCK_PLANS: Plan[] = [
  { id: "plan-basic", slug: "basic", name: "Basic", price_monthly: 99, max_units: 1 },
  { id: "plan-pro", slug: "pro", name: "Pro", price_monthly: 249, max_units: 3 },
  { id: "plan-enterprise", slug: "enterprise", name: "Enterprise", price_monthly: 599, max_units: 10 },
];

const MOCK_USERS = [
  { id: "u1", full_name: "João Silva" },
  { id: "u2", full_name: "Maria Souza" },
  { id: "u3", full_name: "Carlos Lima" },
];

function ClienteDetail() {
  const { id } = Route.useParams();
  // MOCK: dados estáticos por id.
  const [planId, setPlanId] = useState<string>("plan-pro");
  const [access, setAccess] = useState<Record<string, "active" | "trial" | "blocked">>(() => {
    const a: Record<string, "active" | "trial" | "blocked"> = {};
    MODULES.forEach((m, i) => (a[m.id] = i === 0 ? "active" : i === 1 ? "trial" : "blocked"));
    return a;
  });
  const [msg, setMsg] = useState<string | null>(null);

  const tenantName = `Cliente ${id}`;
  const subscriptionStatus = "active";
  const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
  const unitCount = 2;

  const setModule = (moduleSlug: string, status: "active" | "trial" | "blocked") => {
    setAccess((a) => ({ ...a, [moduleSlug]: status }));
    setMsg(`Módulo ${moduleSlug} → ${status}.`);
    setTimeout(() => setMsg(null), 2000);
  };

  const setPlan = (newPlanId: string) => {
    setPlanId(newPlanId);
    setMsg("Plano alterado.");
    setTimeout(() => setMsg(null), 2000);
  };

  const currentPlan = MOCK_PLANS.find((p) => p.id === planId);

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/admin/clientes" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{tenantName}</h1>
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-zinc-400">
          <span>Status: <span className="text-zinc-200">{subscriptionStatus}</span></span>
          <span>•</span>
          <span>{MOCK_USERS.length} usuários</span>
          <span>•</span>
          <span>{unitCount} filiais</span>
          <span>•</span>
          <span>Cadastrado {new Date(createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      </header>

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200">{msg}</div>
      )}

      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-3">Plano</h2>
        <p className="text-xs text-zinc-400 mb-3">
          Atual: <span className="text-zinc-100 font-medium">{currentPlan?.name ?? "Nenhum"}</span>
          {currentPlan && <> — R$ {currentPlan.price_monthly.toFixed(2)}/mês • {currentPlan.max_units} {currentPlan.max_units === 1 ? "filial" : "filiais"}</>}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MOCK_PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              disabled={p.id === planId}
              className={
                "p-3 rounded-lg border text-left transition " +
                (p.id === planId
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

      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-1">Módulos</h2>
        <p className="text-xs text-zinc-400 mb-4">Liberar/bloquear acesso manual.</p>
        <div className="space-y-2">
          {MODULES.map((m) => {
            const status = access[m.id] ?? "blocked";
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{m.short}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <ModuleBtn current={status} target="active" onClick={() => setModule(m.id, "active")} icon={Check} label="Ativo" color="emerald" />
                  <ModuleBtn current={status} target="trial" onClick={() => setModule(m.id, "trial")} icon={Clock} label="Trial" color="blue" />
                  <ModuleBtn current={status} target="blocked" onClick={() => setModule(m.id, "blocked")} icon={X} label="Bloqueado" color="rose" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold mb-3">Usuários ({MOCK_USERS.length})</h2>
        <ul className="space-y-1.5 text-sm">
          {MOCK_USERS.map((u) => (
            <li key={u.id} className="px-3 py-2 rounded bg-zinc-950 border border-zinc-800">
              {u.full_name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ModuleBtn({
  current, target, onClick, icon: Icon, label, color,
}: { current: string; target: string; onClick: () => void; icon: any; label: string; color: "emerald" | "blue" | "rose" }) {
  const active = current === target;
  const base = "px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border transition disabled:opacity-50";
  const colors: Record<string, string> = {
    emerald: active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30",
    blue: active ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30",
    rose: active ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30",
  };
  return (
    <button onClick={onClick} disabled={active} className={base + " " + colors[color]} title={label}>
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
