import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { MODULES } from "@/lib/modules";
import { SiteNav } from "@/components/landing/SiteNav";
import { SiteFooter } from "@/components/landing/CtaFinal";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRight,
  Check,
  Sparkles,
  Hexagon,
  TrendingDown,
  Clock,
  ShieldCheck,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/programas/$slug")({
  loader: ({ params }) => {
    const m = MODULES.find((x) => x.id === params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  head: ({ loaderData, params }) => {
    const m = loaderData?.module;
    const title = m ? `${m.name} — Hub Nexus` : "Programa — Hub Nexus";
    const desc = m?.description ?? "Programa do ecossistema Hub Nexus.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "keywords", content: `${m?.name ?? ""}, hub nexus, gestão empresarial, ${params.slug}` },
      ],
    };
  },
  component: ProgramLanding,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-display font-semibold">Programa não encontrado</h1>
        <Link to="/" className="text-primary underline text-sm mt-3 inline-block">
          Voltar ao Hub Nexus
        </Link>
      </div>
    </div>
  ),
});

function ProgramLanding() {
  const { module: m } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        {m.id === "devolucoes" ? <DevolucoesLanding /> : <GenericProgramLanding />}
        <CrossSellHub />
      </main>
      <SiteFooter />
    </div>
  );
}

/* =====================================================
 * Landing CUSTOM — Devoluções
 * ===================================================== */
function DevolucoesLanding() {
  const m = MODULES.find((x) => x.id === "devolucoes")!;
  const Icon = m.icon;

  return (
    <>
      {/* HERO */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-animated opacity-70" aria-hidden />
        <div className="absolute inset-0 grid-bg opacity-25 mask-fade-radial" aria-hidden />
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-blob" aria-hidden />
        <div className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-primary-glow/15 blur-3xl animate-blob-slow" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-8"
          >
            <Icon className="h-3.5 w-3.5" />
            Programa do Hub Nexus
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
          >
            Pare de perder dinheiro <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              com devoluções mal geridas
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Centralize devoluções, disputas e reembolsos em um único painel. Cumpra prazos,
            recupere margem e nunca mais perca um caso por desorganização.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/signup" search={{ intent: "devolucoes" }}>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Começar grátis por 7 dias
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" search={{ intent: "devolucoes" }}>
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </motion.div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="relative py-20 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">O problema</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Devolução é onde a margem evapora.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Disputas perdidas por prazo, retrabalho com planilhas, falta de histórico — tudo isso custa caro.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: TrendingDown, stat: "R$ 14k", label: "perda média mensal de e-commerce médio com devoluções não disputadas" },
              { icon: Clock, stat: "72h", label: "é o prazo médio de defesa em marketplaces — fácil de perder sem alerta" },
              { icon: Layers, stat: "8+ canais", label: "diferentes geram disputas: site, marketplace, atacado, físico..." },
            ].map((it, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full">
                  <it.icon className="h-6 w-6 text-primary mb-3" />
                  <div className="font-display text-3xl font-semibold tracking-tight">{it.stat}</div>
                  <p className="text-sm text-muted-foreground mt-2">{it.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES DETALHADAS */}
      <section className="relative py-20 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">O que você ganha</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Tudo que sua operação de devoluções precisa.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: "Dashboard com status em tempo real",
                desc: "Veja todas as disputas abertas, prazos críticos e valores em risco numa só tela. Sem abrir 5 planilhas.",
              },
              {
                title: "Alertas de prazo automáticos",
                desc: "Receba aviso 24h antes de cada vencimento de defesa. Nunca mais perca caso por esquecimento.",
              },
              {
                title: "Histórico completo por pedido",
                desc: "Cada devolução vira um caso com timeline: motivo, evidências, mensagens, resultado. Auditável.",
              },
              {
                title: "Relatórios de perda e recuperação",
                desc: "Quanto você perdeu, quanto recuperou, qual canal mais devolve, qual SKU dá problema. Decisão com dado.",
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg border border-primary/30 bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <RoiCalculator />

      {/* PRICING */}
      <section className="relative py-20 border-t border-border/60" id="precos">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Preço</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Simples, sem letra miúda.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Devoluções avulso
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-5xl font-semibold tracking-tight">R$ {m.price}</span>
                <span className="text-sm text-muted-foreground mb-2">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Apenas o programa de devoluções, completo.</p>
              <ul className="space-y-2.5 mb-7 text-sm">
                {m.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Até 3 usuários
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Suporte por e-mail
                </li>
              </ul>
              <Link to="/signup" search={{ intent: "devolucoes" }}>
                <Button className="w-full" variant="outline" size="lg">
                  Começar 7 dias grátis
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-primary bg-card p-7 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-primary">
                    Hub Nexus completo
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Recomendado
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-5xl font-semibold tracking-tight">R$ 199</span>
                  <span className="text-sm text-muted-foreground mb-2">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Devoluções + escolha 1 programa. Adicione mais quando precisar.
                </p>
                <ul className="space-y-2.5 mb-7 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <strong>Tudo do Devoluções avulso</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Acesso ao ecossistema Hub Nexus
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Estoque, Financeiro, Vendas e mais
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Atualizações e novos programas inclusos
                  </li>
                </ul>
                <Link to="/signup" search={{ intent: "devolucoes" }}>
                  <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90" size="lg">
                    Começar com o Hub completo
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 inline-flex items-center gap-1.5 justify-center w-full">
            <ShieldCheck className="h-3.5 w-3.5" />
            7 dias grátis em qualquer plano. Sem cartão de crédito.
          </p>
        </div>
      </section>
    </>
  );
}

/* =====================================================
 * ROI Calculator (interativo)
 * ===================================================== */
function RoiCalculator() {
  const [devolucoesMes, setDev] = useState(80);
  const [ticketMedio, setTicket] = useState(180);

  const result = useMemo(() => {
    // Estimativa: sem o programa, 35% das disputas são perdidas por desorganização.
    // Com o programa, esse número cai para ~10%.
    const perdaSem = devolucoesMes * ticketMedio * 0.35;
    const perdaCom = devolucoesMes * ticketMedio * 0.10;
    const economia = Math.max(0, perdaSem - perdaCom);
    return {
      perdaSem: Math.round(perdaSem),
      perdaCom: Math.round(perdaCom),
      economia: Math.round(economia),
      payback: Math.max(0.1, 149 / Math.max(1, economia)),
    };
  }, [devolucoesMes, ticketMedio]);

  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <section className="relative py-20 border-t border-border/60">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Calculadora de ROI</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Quanto você está perdendo por mês?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Estimativa conservadora baseada em recuperação de disputas mal geridas.
          </p>
        </Reveal>

        <div className="rounded-2xl border border-border bg-card p-7 md:p-9 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Devoluções por mês</span>
                <span className="font-mono text-primary">{devolucoesMes}</span>
              </label>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={devolucoesMes}
                onChange={(e) => setDev(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2">
                <span>Ticket médio (R$)</span>
                <span className="font-mono text-primary">{fmt(ticketMedio)}</span>
              </label>
              <input
                type="range"
                min={30}
                max={2000}
                step={10}
                value={ticketMedio}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
              />
            </div>
          </div>

          <div className="border-l border-border/60 md:pl-8 pt-2 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Perda atual estimada</p>
              <p className="font-display text-2xl font-semibold text-destructive">{fmt(result.perdaSem)}<span className="text-xs text-muted-foreground font-normal"> /mês</span></p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Perda com Devoluções</p>
              <p className="font-display text-2xl font-semibold">{fmt(result.perdaCom)}<span className="text-xs text-muted-foreground font-normal"> /mês</span></p>
            </div>
            <div className="pt-3 border-t border-border/60">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">Economia projetada</p>
              <p className="font-display text-4xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                {fmt(result.economia)}
                <span className="text-sm text-muted-foreground font-normal"> /mês</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Investimento de R$ 149/mês paga-se sozinho.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
 * Cross-sell — "faz parte de algo maior"
 * ===================================================== */
function CrossSellHub() {
  const others = MODULES.filter((m) => m.id !== Route.useLoaderData().module.id).slice(0, 7);

  return (
    <section className="relative py-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
            <Hexagon className="h-3.5 w-3.5" />
            Faz parte do Hub Nexus
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Um programa hoje. Sua operação inteira amanhã.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sua conta dá acesso a todo o ecossistema. Ative outros programas com 1 clique, no mesmo login,
            sem migração de dados.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {others.map((mod) => {
            const Icon = mod.icon;
            const locked = mod.status === "coming_soon";
            const card = (
              <div className="rounded-xl border border-border bg-card hover:border-primary/40 transition-colors p-4 h-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg border border-primary/30 bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium truncate">{mod.name}</span>
                </div>
                {locked && (
                  <span className="mt-2 inline-block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Em breve
                  </span>
                )}
              </div>
            );
            return locked ? (
              <div key={mod.id}>{card}</div>
            ) : (
              <Link key={mod.id} to="/programas/$slug" params={{ slug: mod.id }}>
                {card}
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline" size="lg">
              Conhecer o Hub Nexus completo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
 * Landing genérica (fallback) — para programas sem landing custom
 * ===================================================== */
function GenericProgramLanding() {
  const { module: m } = Route.useLoaderData();
  const Icon = m.icon;
  const isComingSoon = m.status === "coming_soon";

  return (
    <>
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-animated opacity-70" aria-hidden />
        <div className="absolute inset-0 grid-bg opacity-25 mask-fade-radial" aria-hidden />
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl animate-blob" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-8">
            <Icon className="h-3.5 w-3.5" />
            Programa do Hub Nexus
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {m.name}
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {m.description}
          </p>

          {isComingSoon ? (
            <div className="mt-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm">
                <Sparkles className="h-4 w-4 text-primary" /> Em desenvolvimento — em breve
              </span>
              <p className="mt-4 text-xs text-muted-foreground">
                Cadastre-se no Hub e seja avisado quando lançarmos.
              </p>
              <Link to="/signup" className="inline-block mt-3">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
                  Criar conta no Hub Nexus
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" search={{ intent: m.id }}>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                  Começar grátis por 7 dias
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" search={{ intent: m.id }}>
                <Button size="lg" variant="outline">Já tenho conta</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Recursos</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
              O que está incluído
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {m.features.map((f, i) => (
              <Reveal key={f} delay={i * 0.04}>
                <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-3 h-full">
                  <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing simples */}
      {!isComingSoon && (
        <section className="relative py-20 border-t border-border/60" id="precos">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Preço</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-6">
              R$ {m.price}<span className="text-base text-muted-foreground font-normal">/mês</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Ou inclua no <Link to="/" hash="precos" className="text-primary underline">Hub Nexus completo</Link> a partir de R$ 199/mês.
            </p>
            <Link to="/signup" search={{ intent: m.id }}>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Começar 7 dias grátis
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
