import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Hexagon } from "lucide-react";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export const Route = createFileRoute("/login")({
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
        <div className="rounded-2xl border border-border-strong bg-card-elevated/80 backdrop-blur-2xl shadow-elevated p-8">
          <div className="text-center mb-7">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse o Hub e centralize sua operação.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" required autoComplete="email" />
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

            <Button type="button" variant="outline" className="w-full border-border-strong" size="lg">
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
          <Link to="/signup" className="text-primary font-medium hover:underline">
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
