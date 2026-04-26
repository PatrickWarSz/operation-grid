import { createFileRoute, Link } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/programas")({
  head: () => ({ meta: [{ title: "Programas — Workspace" }] }),
  component: ProgramasIndex,
});

function ProgramasIndex() {
  const { access } = useWorkspace();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight ws-text">Programas</h1>
        <p className="text-sm ws-text-muted mt-2">Todos os programas vinculados à sua conta.</p>
      </header>

      <div className="ws-card divide-y ws-border" style={{ borderColor: "rgb(var(--ws-border))" }}>
        {MODULES.map((m) => {
          const status = access.get(m.id) ?? "blocked";
          const isActive = status === "active" || status === "trial";
          const Icon = m.icon;
          return (
            <div key={m.id} className="flex items-center gap-4 p-4 sm:p-5">
              <div
                className={
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 " +
                  (isActive ? "ws-primary-bg text-white" : "ws-surface-2")
                }
              >
                <Icon className={"h-5 w-5 " + (isActive ? "" : "ws-text-muted")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium ws-text truncate">{m.name}</h3>
                  {status === "trial" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      trial
                    </span>
                  )}
                </div>
                <p className="text-xs ws-text-muted truncate mt-0.5">{m.short}</p>
              </div>
              {isActive ? (
                <Link
                  to="/app/programas/$slug"
                  params={{ slug: m.id }}
                  className="ws-btn-primary text-xs inline-flex items-center gap-1.5"
                >
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs ws-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                  Bloqueado
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
