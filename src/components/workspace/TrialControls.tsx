import { useState } from "react";
import { Sparkles, Clock } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { MODULES, type AppModule } from "@/lib/modules";

/**
 * Botão de iniciar trial de 7 dias num módulo.
 * Substitui o "Saiba mais" no card bloqueado.
 */
export function StartTrialButton({ module: m }: { module: AppModule }) {
  const { startTrial, accessRows } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const row = accessRows.find((r) => r.module_id === m.id);
  const alreadyUsed = row?.trial_started_at != null;

  if (alreadyUsed) return null;
  if (m.status === "coming_soon") return null;

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      await startTrial(m.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Não foi possível iniciar o teste");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handle}
        disabled={loading}
        className="ws-btn-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Iniciando..." : "Testar 7 dias grátis"}
      </button>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

/** Banner que aparece no card ativo quando estiver em trial. */
export function TrialBadge({ moduleId }: { moduleId: string }) {
  const { accessRows } = useWorkspace();
  const row = accessRows.find((r) => r.module_id === moduleId);
  if (!row || row.effective_status !== "trial") return null;
  const days = row.trial_days_left ?? 0;
  return (
    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-500/95 text-white text-[10px] font-semibold px-2 py-1 shadow-md">
      <Clock className="h-3 w-3" />
      {days === 0 ? "trial expira hoje" : `trial · ${days}d`}
    </span>
  );
}

/** Suprime "warning" — mantém compat de export */
export const __TRIAL_HELPERS = { MODULES };
