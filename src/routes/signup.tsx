import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Hexagon, Check, Sparkles } from "lucide-react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { MODULES } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";

type SignupSearch = { intent?: string; redirect?: string };

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): SignupSearch => ({
    intent: typeof search.intent === "string" ? search.intent : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Criar conta — Hub Nexus" },
      { name: "description", content: "Crie sua conta e teste o Hub Nexus por 14 dias gratuitamente." },
    ],
  }),
  component: SignupPage,
});

const PERKS = ["14 dias de teste grátis", "Sem cartão de crédito", "Cancele quando quiser"];

function SignupPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const intentModule = search.intent ? MODULES.find((m) => m.id === search.intent) : undefined;

  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // MOCK: cria sessão fictícia e vai para o app.
    signIn(email || undefined);
    const target = intentModule ? `/app/programas/${intentModule.id}` : "/app";
    navigate({ to: target });
  };

  const onGoogle = () => {
    signIn();
    navigate({ to: "/app" });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <AuthBackdrop />

      <div className="absolute top-0 inset-x-0 px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 group">
          <Hexagon className="h-6 w-6 text-primary fill-primary/10" />
          <span className="font-display text-base font-semibold tracking-tight">
            Hub<span className="text-primary">Nexus</span>
          </span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {intentModule && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/10 p-3 flex items-center gap-2.5 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              Você está criando sua conta para acessar <strong>{intentModule.name}</strong>.
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-2xl shadow-elevated p-8">
          <div className="text-center mb-7">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Criar conta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {intentModule
                ? `Comece a usar ${intentModule.name} em segundos.`
                : "Teste o Hub Nexus por 14 dias. Sem cartão de crédito."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" type="text" placeholder="João Silva" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" type="text" placeholder="Acme Ltda" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              size="lg"
            >
              {intentModule ? `Começar trial de ${intentModule.name}` : "Iniciar teste de 14 dias"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
                <span className="bg-card-elevated px-3 text-muted-foreground font-mono">ou</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full border-border-strong" size="lg" onClick={onGoogle}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z"
                />
              </svg>
              Continuar com Google
            </Button>

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Após 14 dias, escolha quais programas manter ativos.{" "}
              <a className="underline hover:text-foreground" href="#">Termos</a> e{" "}
              <a className="underline hover:text-foreground" href="#">Privacidade</a>.
            </p>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Já tem conta?{" "}
          <Link
            to="/login"
            search={intentModule ? { intent: intentModule.id } : undefined}
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
