import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Lock, Check } from "lucide-react";
import { MODULES } from "@/lib/modules";

export function Hero() {
  const preview = MODULES.slice(0, 6);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-30 mask-fade-radial" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Novo • Plataforma multi-módulos
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight"
          >
            O sistema operacional <br />
            <span className="text-gradient-primary">do seu negócio.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            A operação inteira da sua empresa em um só lugar. Estoque, Financeiro, Vendas,
            Devoluções e mais. Ative apenas o que precisa hoje. Escale conforme cresce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Começar gratuitamente
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#showcase">
              <Button size="lg" variant="outline" className="border-border-strong">
                Ver módulos em ação
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Sem fidelidade
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> White-label completo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Multi-tenant seguro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Setup em minutos
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full opacity-40" aria-hidden />
          <div className="relative rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-xl shadow-elevated p-5">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <div className="ml-3 text-xs text-muted-foreground font-mono">hub.nexus / dashboard</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {preview.map((m, i) => {
                const Icon = m.icon;
                const locked = m.status === "coming_soon";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
                    className={
                      "relative rounded-xl border p-4 aspect-square flex flex-col justify-between overflow-hidden " +
                      (locked
                        ? "border-border bg-locked/40 text-locked-foreground"
                        : "border-primary/20 bg-card hover:border-primary/40 transition-colors")
                    }
                  >
                    {!locked && (
                      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/15 blur-2xl" aria-hidden />
                    )}
                    <Icon className={"h-5 w-5 " + (locked ? "" : "text-primary")} />
                    <div>
                      <div className={"text-[11px] font-medium leading-tight " + (locked ? "" : "text-foreground")}>
                        {m.name}
                      </div>
                      {locked && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px]">
                          <Lock className="h-2.5 w-2.5" />
                          Em breve
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">4 ativos · 2 disponíveis</span>
              <span className="inline-flex items-center gap-1 text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Sistema online
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
