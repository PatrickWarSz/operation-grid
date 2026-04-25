import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES } from "@/lib/modules";
import { Check, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Showcase() {
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const active = MODULES.find((m) => m.id === activeId)!;
  const Icon = active.icon;

  return (
    <section id="showcase" className="relative py-24 border-t border-border/60">
      <div className="absolute inset-0 bg-mesh opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Em ação</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Veja cada programa funcionando.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Clique em um programa à esquerda. A demonstração é exibida ao lado, com play automático.
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Lista lateral */}
          <div className="space-y-2">
            {MODULES.map((m) => {
              const MIcon = m.icon;
              const isActive = m.id === activeId;
              const locked = m.status === "coming_soon";
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 group",
                    isActive
                      ? "border-primary/60 bg-primary/5 shadow-glow"
                      : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <MIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-sm", isActive && "text-foreground")}>
                        {m.name}
                      </span>
                      {locked && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" /> em breve
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.short}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-border-strong bg-card-elevated overflow-hidden shadow-elevated aspect-video">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  {/* Slot pronto pro GIF/MP4 do cliente */}
                  <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
                  <div className="absolute inset-0 bg-mesh opacity-50" aria-hidden />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-1">{active.name}</h3>
                    <p className="text-sm text-muted-foreground max-w-md">{active.short}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground font-mono px-3 py-1.5 rounded-full border border-border bg-background/50">
                      <PlayCircle className="h-3.5 w-3.5 text-primary" />
                      Slot pronto para vídeo / GIF
                    </div>
                  </div>

                  {/* Header simulando "janela" */}
                  <div className="absolute top-0 inset-x-0 flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-background/40 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-destructive/50" />
                    <span className="h-2 w-2 rounded-full bg-warning/50" />
                    <span className="h-2 w-2 rounded-full bg-success/50" />
                    <span className="ml-3 text-[10px] font-mono text-muted-foreground">
                      hubnexus.app / {active.id}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              key={active.id + "-desc"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h4 className="font-display text-lg font-semibold mb-2">Sobre {active.name}</h4>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{active.description}</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {active.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/90">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
