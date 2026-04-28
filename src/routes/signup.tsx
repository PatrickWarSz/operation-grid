import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Hexagon, Check, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { supabase } from "@/integrations/supabase/client";
import { MODULES } from "@/lib/modules";

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

const PERKS = [
  "14 dias de teste grátis",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

function SignupPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: name, company_name: company },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/app" });
    } else {
      setInfo("Conta criada! Verifique seu e-mail para confirmar e poder entrar.");
    }
  };

  const onGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) setError(error.message);
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
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span>{info}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" type="text" placeholder="João Silva" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" type="text" placeholder="Acme Ltda" required value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
              disabled={loading}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              size="lg"
            >
              {loading ? "Criando conta..." : "Iniciar teste de 14 dias"}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
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
