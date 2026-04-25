import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Hexagon, Check } from "lucide-react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — Hub Nexus" },
      { name: "description", content: "Crie sua conta e teste o Hub Nexus por 14 dias gratuitamente." },
    ],
  }),
  component: SignupPage,
});

const PERKS = [
  "14 dias de teste grátis",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

function SignupPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <AuthBackdrop />

      <div className="absolute top-0 inset-x-0 px-6 py-5 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <Hexagon className="h-6 w-6 text-primary fill-primary/10 transition-all group-hover:fill-primary/20" />
          <span className="font-display text-base font-semibold tracking-tight">
            Hub<span className="text-primary">Nexus</span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o site
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-2xl shadow-elevated p-8">
          <div className="text-center mb-7">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Criar conta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Teste o Hub Nexus por 14 dias. Sem cartão de crédito.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" type="text" placeholder="João Silva" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" type="text" placeholder="Acme Ltda" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" required autoComplete="email" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-1.5 pt-1">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {p}
                </li>
              ))}
            </ul>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              size="lg"
            >
              {loading ? "Criando conta..." : "Iniciar teste de 14 dias"}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Após 14 dias, escolha quais programas manter ativos para continuar.{" "}
              <a className="underline hover:text-foreground" href="#">Termos</a> e{" "}
              <a className="underline hover:text-foreground" href="#">Privacidade</a>.
            </p>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
