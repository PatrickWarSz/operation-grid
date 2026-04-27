import { MousePointerClick, ToggleRight, TrendingUp } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/Reveal";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Escolha seus programas",
    desc: "Selecione apenas os programas que sua empresa precisa hoje. Sem pagar pelo que não usa.",
  },
  {
    icon: ToggleRight,
    title: "Ative em minutos",
    desc: "Cadastro, branding e equipe configurados rápido. Você opera no mesmo dia.",
  },
  {
    icon: TrendingUp,
    title: "Escale conforme cresce",
    desc: "Adicione novos programas a qualquer momento. Tudo conectado, sem migração.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Como funciona</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Seu hub, do seu jeito, em 3 passos.
          </h2>
        </Reveal>

        <RevealStagger className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <RevealItem key={s.title}>
                <div className="relative rounded-2xl border border-border bg-card p-8 hover:border-primary/40 transition-colors group h-full">
                  <div className="absolute top-6 right-6 font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
