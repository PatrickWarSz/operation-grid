import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Lock, Check } from "lucide-react";
import { MODULES } from "@/lib/modules";

export function Hero() {
  const preview = MODULES.slice(0, 8);

  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-25 mask-fade-radial" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Plataforma multi-programas para empresas
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight max-w-3xl mx-auto"
        >
          A operação inteira da sua empresa,{" "}
          <span className="text-gradient-primary">em um só lugar.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Estoque, Financeiro, Vendas, Devoluções e mais. Ative apenas o que precisa hoje,
          escale conforme cresce.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-wrap justify-center gap-3"
        >
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              Começar teste de 14 dias
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <a href="#showcase">
            <Button size="lg" variant="outline" className="border-border-strong">
              Ver programas em ação
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" /> 14 dias grátis
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" /> Sem cartão de crédito
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" /> White-label completo
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-primary" /> Setup em minutos
          </span>
        </motion.div>
      </div>

      {/* Preview das telas iniciais dos programas */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative mx-auto max-w-6xl px-6 mt-20"
      >
        <div className="absolute -inset-x-12 -inset-y-8 bg-primary/10 blur-3xl rounded-full opacity-50" aria-hidden />

        <div className="relative rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-xl shadow-elevated overflow-hidden">
          {/* janela */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-border/60 bg-background/40">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <div className="ml-3 text-xs text-muted-foreground font-mono">hubnexus.app / dashboard</div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Sistema online
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Seus programas</p>
                <h3 className="font-display text-xl font-semibold mt-1">Centro de comando</h3>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                4 ativos · 4 disponíveis
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {preview.map((m, i) => {
                const Icon = m.icon;
                const locked = m.status === "coming_soon";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                    className={
                      "relative rounded-xl border p-4 aspect-square flex flex-col justify-between overflow-hidden " +
                      (locked
                        ? "border-border bg-locked/40 text-locked-foreground"
                        : "border-primary/20 bg-card hover:border-primary/40 transition-colors cursor-pointer")
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
                      {locked ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px]">
                          <Lock className="h-2.5 w-2.5" />
                          Em breve
                        </div>
                      ) : (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-success">
                          <span className="h-1 w-1 rounded-full bg-success" />
                          Ativo
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
