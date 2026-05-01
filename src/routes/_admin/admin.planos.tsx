import { createFileRoute } from "@tanstack/react-router";

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

const MOCK_PLANS: Plan[] = [
  {
    id: "plan-basic",
    slug: "basic",
    name: "Basic",
    price_monthly: 99,
    max_units: 1,
    module_slugs: ["estoque"],
    description: "Para começar com o essencial. Ideal para 1 unidade.",
    active: true,
  },
  {
    id: "plan-pro",
    slug: "pro",
    name: "Pro",
    price_monthly: 249,
    max_units: 3,
    module_slugs: ["estoque", "vendas", "financeiro"],
    description: "Para empresas em crescimento que precisam de mais módulos.",
    active: true,
  },
  {
    id: "plan-enterprise",
    slug: "enterprise",
    name: "Enterprise",
    price_monthly: 599,
    max_units: 10,
    module_slugs: ["estoque", "vendas", "financeiro", "rh", "bi"],
    description: "Tudo incluso para operações multi-filial.",
    active: true,
  },
];

function PlanosPage() {
  const plans = MOCK_PLANS;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Planos</h1>
        <p className="text-sm text-zinc-400 mt-1">Edição completa virá com a integração de cobrança.</p>
      </header>

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
    </div>
  );
}
