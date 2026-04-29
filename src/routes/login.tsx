import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Hexagon, AlertCircle, Sparkles } from "lucide-react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { supabase } from "@/integrations/supabase/client";
import { MODULES } from "@/lib/modules";
import { isAllowedSatelliteUrl, buildSatelliteUrl } from "@/lib/satellite-handoff";

type LoginSearch = { intent?: string; redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    intent: typeof search.intent === "string" ? search.intent : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Hub Nexus" },
      { name: "description", content: "Acesse o Hub Nexus e gerencie a operação da sua empresa." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const intentModule = search.intent ? MODULES.find((m) => m.id === search.intent) : undefined;

  // Aceita redirect EXTERNO se for satélite whitelisted, ou path interno.
  // Defensivo contra open redirect: qualquer URL absoluta não-whitelisted é descartada.
  const rawRedirect = search.redirect;
  const isExternal = !!rawRedirect && /^https?:\/\//i.test(rawRedirect);
  const externalRedirect = isExternal && rawRedirect && isAllowedSatelliteUrl(rawRedirect) ? rawRedirect : null;
  const internalRedirect =
    !isExternal && rawRedirect
      ? rawRedirect
      : intentModule
      ? `/app/programas/${intentModule.id}`
      : "/app";

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const buildInternalTarget = () =>
    `${internalRedirect}${
      intentModule ? (internalRedirect.includes("?") ? "&" : "?") + "intent=" + intentModule.id : ""
    }`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
      return;
    }
    // Redirect externo (satélite): handoff via fragment com access_token/refresh_token.
    if (externalRedirect && data.session) {
      window.location.href = buildSatelliteUrl(externalRedirect, data.session);
      return;
    }
    // hard nav garante que o workspace leia ?intent= do URL
    window.location.href = buildInternalTarget();
  };

  const onGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${buildTarget()}` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <AuthBackdrop />

      {/* topo */}
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

      {/* card centralizado */}
      <div className="relative z-10 w-full max-w-md">
        {intentModule && (
          <div className="mb-4 rounded-xl border border-primary/40 bg-primary/10 p-3 flex items-center gap-2.5 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              Entre para acessar <strong>{intentModule.name}</strong>. Já é nosso cliente? Sua conta Hub libera o programa.
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-2xl shadow-elevated p-8">
          <div className="text-center mb-7">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {intentModule ? `Acesse sua conta para ativar ${intentModule.name}.` : "Acesse o Hub e centralize sua operação."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/login" className="text-xs text-muted-foreground hover:text-primary">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              size="lg"
            >
              {loading ? "Entrando..." : "Entrar"}
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
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            to="/signup"
            search={intentModule ? { intent: intentModule.id, redirect: redirectTarget } : undefined}
            className="text-primary font-medium hover:underline"
          >
            Criar conta gratuita
          </Link>
        </p>
      </div>

      <p className="absolute bottom-5 inset-x-0 text-[11px] text-muted-foreground text-center font-mono z-10">
        Protegido por criptografia ponta-a-ponta · Multi-tenant
      </p>
    </div>
  );
}
