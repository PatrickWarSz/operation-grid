import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/clientes/")({
  head: () => ({ meta: [{ title: "Admin — Clientes" }] }),
  component: ClientesList,
});

interface TenantRow {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  trial_ends_at: string | null;
  plan_id: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  trial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  overdue: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  cancelled: "bg-zinc-700/40 text-zinc-400 border-zinc-700",
};

function ClientesList() {
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const sb = supabase as unknown as { from: (t: string) => any };
    const { data } = await sb
      .from("tenants")
      .select("id, name, subscription_status, created_at, trial_ends_at, plan_id")
      .order("created_at", { ascending: false });
    setRows((data as TenantRow[]) ?? []);
    setLoading(false);
  }

  const filtered = rows
    .filter((r) => filter === "all" || r.subscription_status === filter)
    .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-zinc-400 mt-1">{rows.length} {rows.length === 1 ? "tenant" : "tenants"} no total.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-zinc-700"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            ["all", "Todos"],
            ["active", "Ativos"],
            ["trial", "Trial"],
            ["overdue", "Inadimplentes"],
            ["cancelled", "Cancelados"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition " +
                (filter === k ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        {loading ? (
          <p className="p-5 text-sm text-zinc-500">carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Nenhum cliente encontrado.</p>
        ) : (
          filtered.map((t) => (
            <Link
              key={t.id}
              to="/admin/clientes/$id"
              params={{ id: t.id }}
              className="flex items-center justify-between p-4 hover:bg-zinc-800/40 transition"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Cadastrado {new Date(t.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className={"text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border " + (STATUS_BADGE[t.subscription_status] ?? STATUS_BADGE.cancelled)}>
                {t.subscription_status}
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-600 ml-3" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
