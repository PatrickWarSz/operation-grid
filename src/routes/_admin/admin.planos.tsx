import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin/planos")({
  head: () => ({ meta: [{ title: "Admin — Planos" }] }),
  component: PlanosPage,
});

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_monthly: number;
  max_units: number;
  module_slugs: string[];
  description: string | null;
  active: boolean;
}

function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const sb = supabase as unknown as { from: (t: string) => any };
      const { data } = await sb.from("plans").select("*").order("price_monthly");
      setPlans((data as Plan[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Planos</h1>
        <p className="text-sm text-zinc-400 mt-1">Edição completa virá com a integração Asaas (Etapa B).</p>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500">carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{p.slug}</p>
              <h3 className="text-lg font-semibold mt-1">{p.name}</h3>
              <p className="text-2xl font-bold text-amber-400 mt-3">
                R$ {p.price_monthly.toFixed(2)}<span className="text-xs text-zinc-500 font-normal">/mês</span>
              </p>
              <p className="text-xs text-zinc-400 mt-3">{p.description}</p>
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1.5 text-xs">
                <p className="text-zinc-300">{p.max_units} {p.max_units === 1 ? "filial" : "filiais"}</p>
                <p className="text-zinc-500">Módulos: {p.module_slugs.join(", ") || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
