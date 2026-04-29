import { createFileRoute } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/_admin/admin/modulos")({
  head: () => ({ meta: [{ title: "Admin — Módulos" }] }),
  component: ModulosPage,
});

function ModulosPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Catálogo de módulos</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Hoje os módulos vêm do código (<code className="text-amber-400">src/lib/modules.ts</code>). Edição visual virá depois.
        </p>
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        {MODULES.map((m) => (
          <div key={m.id} className="p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{m.name}</p>
                {m.status === "coming_soon" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Em breve
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{m.short}</p>
              {m.externalUrl && (
                <p className="text-[10px] text-zinc-600 mt-1 font-mono">{m.externalUrl}</p>
              )}
            </div>
            <p className="text-sm text-amber-400 font-semibold whitespace-nowrap">
              R$ {m.price.toFixed(2)}<span className="text-xs text-zinc-500 font-normal">/mês</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
