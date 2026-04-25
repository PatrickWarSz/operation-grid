import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";

/**
 * Fundo full-screen animado para login/signup.
 * Simula uma "operação rodando" com grid de programas pulsando.
 * Quando você tiver os GIFs/MP4, troque o conteúdo de cada célula
 * (data-slot="program-tile") por um <video> ou <img>.
 */
export function AuthBackdrop() {
  // duplica os programas pra preencher mais espaço
  const tiles = [...MODULES, ...MODULES, ...MODULES].slice(0, 18);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* base + textura */}
      <div className="absolute inset-0 bg-background" aria-hidden />
      <div className="absolute inset-0 bg-mesh opacity-90" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-15" aria-hidden />

      {/* glows */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" aria-hidden />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-glow/15 blur-[140px]" aria-hidden />

      {/* grid de programas em loop sutil */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="grid grid-cols-6 gap-3 p-6 w-full max-w-[1400px] opacity-50"
          style={{ transform: "perspective(1400px) rotateX(8deg) rotateZ(-2deg) scale(1.05)" }}
        >
          {tiles.map((m, i) => {
            const Icon = m.icon;
            const locked = m.status === "coming_soon";
            return (
              <motion.div
                key={`${m.id}-${i}`}
                data-slot="program-tile"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (i % 12) * 0.04 }}
                className={
                  "relative aspect-video rounded-xl border overflow-hidden " +
                  (locked
                    ? "border-border bg-locked/40"
                    : "border-primary/20 bg-card-elevated/70 backdrop-blur-sm")
                }
              >
                {!locked && (
                  <>
                    <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/15 blur-2xl" aria-hidden />
                    <motion.div
                      className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18 }}
                    />
                  </>
                )}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive/40" />
                    <span className="h-1.5 w-1.5 rounded-full bg-warning/40" />
                    <span className="h-1.5 w-1.5 rounded-full bg-success/40" />
                  </div>
                  <div className="flex items-end justify-between">
                    <Icon className={"h-4 w-4 " + (locked ? "text-locked-foreground" : "text-primary")} />
                    <span className="text-[8px] font-mono text-muted-foreground truncate max-w-[70%] text-right">
                      {m.id}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* vinheta forte para o formulário ler bem */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, color-mix(in oklab, var(--background) 75%, transparent) 45%, var(--background) 80%)",
        }}
        aria-hidden
      />
    </div>
  );
}
