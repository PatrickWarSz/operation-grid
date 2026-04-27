import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { MODULES } from "@/lib/modules";
import { recommendedModuleIds, pickRecommended, SEGMENTS, PAINS } from "@/lib/recommendations";
import { StartTrialButton } from "./TrialControls";
import { motion } from "framer-motion";

/**
 * Estado vazio do dashboard: cliente sem módulos ativos.
 * Usa segmento + dor pra recomendar 2-3 programas pra começar.
 */
export function EmptyStateRecommendations() {
  const { profileMeta } = useWorkspace();
  const ids = recommendedModuleIds({ segment: profileMeta.segment, pain: profileMeta.main_pain });
  const recs = pickRecommended(MODULES, ids);

  const segLabel = SEGMENTS.find((s) => s.id === profileMeta.segment)?.label;
  const painLabel = PAINS.find((p) => p.id === profileMeta.main_pain)?.label;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ws-card p-8 sm:p-10"
    >
      <div className="flex items-center gap-2 ws-primary-text mb-3">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Comece por aqui</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold ws-text">
        Selecionamos o que mais combina com você
      </h2>
      <p className="text-sm ws-text-muted mt-2 max-w-2xl">
        {segLabel && painLabel ? (
          <>Como você é de <strong className="ws-text">{segLabel}</strong> e mencionou <em>"{painLabel.toLowerCase()}"</em>, estes programas vão fazer mais diferença pra você.</>
        ) : (
          <>Estes são os programas que mais transformam operações como a sua. Comece com 7 dias grátis em qualquer um.</>
        )}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {recs.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border ws-border p-5 flex flex-col"
              style={{ backgroundColor: "rgb(var(--ws-surface-2) / 0.4)" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg ws-primary-bg text-white flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold ws-text">{m.name}</h3>
              </div>
              <p className="text-xs ws-text-muted mt-3 flex-1">{m.short}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <StartTrialButton module={m} />
                <Link
                  to="/app/catalogo"
                  className="text-[11px] font-medium ws-text-muted hover:ws-text inline-flex items-center gap-1"
                >
                  detalhes <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
