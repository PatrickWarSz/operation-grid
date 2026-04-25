import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Painel lateral animado com grid de módulos para as telas de login/signup.
 * Os cards "ativos" pulsam suavemente, simulando uma operação real rodando.
 * Pronto para receber os GIFs/MP4 dos módulos no futuro (basta trocar o conteúdo
 * das células marcadas com data-slot="module-preview").
 */
export function AuthShowcase({ tagline }: { tagline?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-card-elevated">
      <div className="absolute inset-0 bg-mesh opacity-90" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-25" aria-hidden />

      {/* glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" aria-hidden />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-primary-glow/15 blur-[120px]" aria-hidden />

      <div className="relative h-full w-full flex flex-col p-10 lg:p-14">
        {/* topo: bordão */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
            Hub Nexus
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-tight max-w-md">
            {tagline ?? "Bem-vindo de volta ao centro de comando."}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Toda sua operação em um só lugar. Estoque, financeiro, devoluções e mais — rodando agora.
          </p>
        </div>

        {/* grid de módulos animado */}
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
          {MODULES.slice(0, 6).map((m, i) => {
            const Icon = m.icon;
            const locked = m.status === "coming_soon";
            return (
              <motion.div
                key={m.id}
                data-slot="module-preview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn(
                  "relative aspect-square rounded-xl border p-3 flex flex-col justify-between overflow-hidden",
                  locked
                    ? "border-border bg-locked/40 text-locked-foreground"
                    : "border-primary/25 bg-card",
                )}
              >
                {!locked && (
                  <>
                    <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/15 blur-2xl" aria-hidden />
                    <motion.div
                      className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </>
                )}
                <Icon className={cn("h-4 w-4", locked ? "" : "text-primary")} />
                <div className="text-[10px] font-medium leading-tight">
                  {m.name}
                  {locked && (
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[9px]">
                      <Lock className="h-2 w-2" /> em breve
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* rodapé do painel */}
        <div className="mt-auto pt-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono">Sistema online · multi-tenant ativo</span>
          </div>
          <blockquote className="mt-5 border-l-2 border-primary/60 pl-4 text-sm text-foreground/80 italic max-w-md">
            "Paramos de pular entre 5 sistemas. Hoje a empresa inteira opera dentro do Hub."
            <footer className="mt-2 not-italic text-xs text-muted-foreground">
              — Cliente piloto, indústria de embalagens
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
