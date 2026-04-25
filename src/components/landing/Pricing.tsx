import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MODULES, PLANS } from "@/lib/modules";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Pricing() {
  const available = MODULES.filter((m) => m.status === "available");
  const [selected, setSelected] = useState<string[]>(["devolucoes"]);

  const total = useMemo(
    () => available.filter((m) => selected.includes(m.id)).reduce((s, m) => s + m.price, 0),
    [selected, available],
  );

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // 10% discount when 3+ modules
  const discount = selected.length >= 3 ? Math.round(total * 0.1) : 0;
  const finalTotal = total - discount;

  return (
    <section id="precos" className="relative py-24 border-t border-border/60">
      <div className="absolute inset-0 bg-radial opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Planos</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Escolha um plano ou monte o seu.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sem fidelidade. Cancele ou reconfigure quando quiser.
          </p>
        </div>

        {/* Planos prontos */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => {
            const popular = plan.badge === "Mais popular";
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border p-7 flex flex-col",
                  popular
                    ? "border-primary/60 bg-card-elevated shadow-elevated"
                    : "border-border bg-card",
                )}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                      <Sparkles className="h-3 w-3" /> {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="font-display text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup" className="mt-7">
                  <Button
                    className={cn(
                      "w-full",
                      popular
                        ? "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                        : "",
                    )}
                    variant={popular ? "default" : "outline"}
                  >
                    Começar com {plan.name}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Builder */}
        <div className="rounded-3xl border border-border-strong bg-card-elevated/60 backdrop-blur-xl p-8 md:p-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 mb-8 items-end">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Monte o seu</p>
              <h3 className="font-display text-3xl font-semibold tracking-tight">
                Pague apenas pelos módulos que vai usar.
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Selecione abaixo. 3 módulos ou mais ganham <span className="text-primary font-medium">10% de desconto</span>.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-3">
              {available.map((m) => {
                const Icon = m.icon;
                const isOn = selected.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all",
                      isOn
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card hover:border-border-strong",
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        isOn ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{m.short}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">R$ {m.price}</div>
                      <div className="text-[10px] text-muted-foreground">/mês</div>
                    </div>
                    <Switch checked={isOn} onCheckedChange={() => toggle(m.id)} />
                  </label>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border-strong bg-background/60 p-6 h-fit md:sticky md:top-24">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Resumo
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {selected.length} {selected.length === 1 ? "módulo selecionado" : "módulos selecionados"}
              </div>
              <div className="space-y-1 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">R$ {total}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto (10%)</span>
                    <span className="font-mono">- R$ {discount}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-4 mb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total mensal</span>
                  <div>
                    <span className="font-display text-3xl font-semibold">R$ {finalTotal}</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                </div>
              </div>
              <Link to="/signup">
                <Button
                  className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                  disabled={selected.length === 0}
                >
                  Contratar agora
                </Button>
              </Link>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Sem fidelidade • Cancele a qualquer momento
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
