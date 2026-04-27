import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-animated opacity-70" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-25 mask-fade-radial" aria-hidden />
      {/* Blobs flutuantes */}
      <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-blob" aria-hidden />
      <div className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-primary-glow/15 blur-3xl animate-blob-slow" aria-hidden />


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
          className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto"
        >
          A operação inteira da sua empresa{" "}
          <span className="text-gradient-primary">em um só lugar</span>
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

      {/* Mosaico de mockups das telas dos programas */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative mx-auto max-w-7xl px-6 mt-20"
      >
        <div className="absolute -inset-x-12 -inset-y-8 bg-primary/10 blur-3xl rounded-full opacity-50" aria-hidden />

        <div className="relative grid grid-cols-12 gap-4 md:gap-5">
          <MockWindow title="financeiro · fluxo" className="col-span-12 md:col-span-5 h-64 md:h-80">
            <div className="h-full w-full p-4 flex flex-col gap-3">
              <div className="flex items-end justify-between flex-1 gap-1.5">
                {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary/10 to-primary/40" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>jan</span><span>fev</span><span>mar</span><span>abr</span><span>mai</span><span>jun</span><span>jul</span>
              </div>
            </div>
          </MockWindow>

          <MockWindow title="BI · executive" className="col-span-12 md:col-span-7 h-64 md:h-80">
            <div className="h-full w-full p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/40 p-3 flex flex-col justify-between h-20">
                  <span className="text-[10px] text-muted-foreground">Receita</span>
                  <span className="font-mono text-primary text-sm">R$ 482k</span>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-3 flex flex-col justify-between h-20">
                  <span className="text-[10px] text-muted-foreground">Margem</span>
                  <span className="font-mono text-success text-sm">32%</span>
                </div>
              </div>
              <div className="flex items-end gap-2 flex-1">
                {[35, 50, 45, 65, 55, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 rounded-md bg-gradient-to-t from-primary/30 to-primary/70" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </MockWindow>

          <MockWindow title="vendas · funil" className="col-span-12 md:col-span-4 h-56 md:h-72">
            <div className="h-full w-full p-4 flex flex-col gap-2">
              <div className="h-3 rounded-full bg-gradient-to-r from-primary/60 to-primary/30 w-[95%]" />
              <div className="h-3 rounded-full bg-gradient-to-r from-primary/50 to-primary/25 w-[72%]" />
              <div className="h-3 rounded-full bg-gradient-to-r from-primary/45 to-primary/20 w-[55%]" />
              <div className="h-3 rounded-full bg-gradient-to-r from-primary/40 to-primary/15 w-[34%]" />
              <div className="mt-auto text-[10px] font-mono text-muted-foreground">conv. 28%</div>
            </div>
          </MockWindow>

          <MockWindow title="estoque · skus" className="col-span-12 md:col-span-4 h-56 md:h-72">
            <div className="h-full w-full p-3 flex flex-col gap-1.5">
              {[
                { n: "Parafuso M6", q: "1240", ok: true },
                { n: "Chapa Aço 2mm", q: "12", ok: false },
                { n: "Tinta Branca", q: "480", ok: true },
                { n: "Cabo USB-C", q: "96", ok: true },
              ].map((r) => (
                <div key={r.n} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-md border border-border/50 bg-background/30">
                  <span className="text-foreground/80 truncate">{r.n}</span>
                  <span className={"font-mono " + (r.ok ? "text-success" : "text-warning")}>{r.q}</span>
                </div>
              ))}
            </div>
          </MockWindow>

          <MockWindow title="produção · OPs" className="col-span-12 md:col-span-4 h-56 md:h-72">
            <div className="h-full w-full p-3 grid grid-cols-3 grid-rows-2 gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={
                    "rounded-md border " +
                    (i === 5
                      ? "border-warning/40 bg-gradient-to-br from-warning/30 to-warning/10"
                      : "border-primary/30 bg-gradient-to-br from-primary/40 to-primary/15")
                  }
                />
              ))}
            </div>
          </MockWindow>
        </div>
      </motion.div>
    </section>
  );
}

function MockWindow({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-xl shadow-elevated overflow-hidden flex flex-col " +
        (className ?? "")
      }
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-background/40 shrink-0">
        <span className="h-2 w-2 rounded-full bg-destructive/60" />
        <span className="h-2 w-2 rounded-full bg-warning/60" />
        <span className="h-2 w-2 rounded-full bg-success/60" />
        <span className="ml-2 text-[10px] font-mono text-muted-foreground">{title}</span>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
