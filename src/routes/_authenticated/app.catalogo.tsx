import { createFileRoute, Link } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Check, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo — Workspace" }] }),
  component: Catalogo,
});

function Catalogo() {
  const { access } = useWorkspace();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight ws-text">Catálogo de programas</h1>
        <p className="text-sm ws-text-muted mt-2 max-w-2xl">
          Conheça todos os programas disponíveis. Ative quando fizer sentido para sua operação.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MODULES.map((m) => {
          const status = access.get(m.id);
          const isActive = status === "active" || status === "trial";
          const comingSoon = m.status === "coming_soon";
          const Icon = m.icon;
          return (
            <div key={m.id} className="ws-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={
                    "h-10 w-10 rounded-lg flex items-center justify-center " +
                    (isActive ? "ws-primary-bg text-white" : "ws-surface-2")
                  }
                >
                  <Icon className={"h-5 w-5 " + (isActive ? "" : "ws-text-muted")} />
                </div>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                    Ativo
                  </span>
                ) : comingSoon ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ws-surface-2 ws-text-muted">
                    <Sparkles className="h-3 w-3" />
                    em breve
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ws-surface-2 ws-text-muted">
                    <Lock className="h-3 w-3" />
                    bloqueado
                  </span>
                )}
              </div>

              <h3 className="font-semibold ws-text mt-4">{m.name}</h3>
              <p className="text-xs ws-text-muted mt-1">{m.description}</p>

              <ul className="mt-4 space-y-1.5 flex-1">
                {m.features.slice(0, 3).map((f) => (
                  <li key={f} className="text-xs ws-text-muted flex items-start gap-2">
                    <Check className="h-3 w-3 mt-0.5 ws-primary-text shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t ws-border flex items-center justify-between" style={{ borderTopWidth: 1 }}>
                <span className="text-sm font-semibold ws-text">
                  R$ {m.price}
                  <span className="text-[11px] font-normal ws-text-muted">/mês</span>
                </span>
                {isActive ? (
                  <Link to="/app/programas/$slug" params={{ slug: m.id }} className="ws-btn-ghost text-xs">
                    Abrir
                  </Link>
                ) : comingSoon ? (
                  <span className="text-[11px] ws-text-muted">aguarde</span>
                ) : (
                  <span className="text-[11px] ws-text-muted">bloqueado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
