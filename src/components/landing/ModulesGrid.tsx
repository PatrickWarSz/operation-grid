import { MODULES } from "@/lib/modules";
import { Lock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";
import { Link } from "@tanstack/react-router";

export function ModulesGrid() {
  return (
    <section id="programas" className="relative py-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Catálogo</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Todos os programas do ecossistema.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Compre individualmente ou monte um plano. Novos programas chegam constantemente.
          </p>
        </Reveal>

        <RevealStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.05}>
          {MODULES.map((m) => {
            const Icon = m.icon;
            const locked = m.status === "coming_soon";

            const cardInner = (
              <>
                {!locked && (
                  <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors" aria-hidden />
                )}
                <div className="relative">
                  <div
                    className={cn(
                      "h-11 w-11 rounded-xl border flex items-center justify-center mb-4",
                      locked
                        ? "border-border bg-background/30"
                        : "border-primary/30 bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className={cn("font-display font-semibold", locked && "opacity-80")}>{m.name}</h3>
                    {locked ? (
                      <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <p className={cn("text-sm leading-relaxed mb-4", locked ? "" : "text-muted-foreground")}>
                    {m.short}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md",
                        locked
                          ? "bg-background/40 text-muted-foreground"
                          : "bg-success/15 text-success",
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", locked ? "bg-muted-foreground" : "bg-success")} />
                      {locked ? "Em breve" : "Disponível"}
                    </span>
                    {!locked && (
                      <span className="text-xs font-mono text-muted-foreground">
                        R$ {m.price}
                        <span className="text-[10px]">/mês</span>
                      </span>
                    )}
                  </div>
                </div>
              </>
            );

            const baseClass = cn(
              "group relative rounded-2xl border p-6 transition-all overflow-hidden h-full block",
              locked
                ? "border-border bg-locked/30 text-locked-foreground"
                : "border-border bg-card hover:border-primary/50 hover:bg-card-elevated cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
            );

            return (
              <RevealItem key={m.id}>
                {locked ? (
                  <div className={baseClass}>{cardInner}</div>
                ) : (
                  <Link
                    to="/programas/$slug"
                    params={{ slug: m.id }}
                    className={baseClass}
                    aria-label={`Conhecer ${m.name}`}
                  >
                    {cardInner}
                  </Link>
                )}
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
