import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — Hub Nexus" },
      { name: "description", content: "Crie sua conta no Hub Nexus e ative os módulos do seu negócio." },
    ],
  }),
  component: SignupPage,
});

const PERKS = [
  "Sem fidelidade",
  "Configuração em minutos",
  "White-label do seu jeito",
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
    <AuthLayout
      title="Crie sua conta."
      subtitle="Comece em minutos. Ative apenas o que sua empresa precisa."
      tagline="A sua operação inteira começa em um clique."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </>
      }
    >
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

        <ul className="space-y-1.5 pt-1">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> {p}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          size="lg"
        >
          {loading ? "Criando conta..." : "Criar conta gratuita"}
          {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Ao criar conta você concorda com os{" "}
          <a className="underline hover:text-foreground" href="#">Termos</a> e a{" "}
          <a className="underline hover:text-foreground" href="#">Política de Privacidade</a>.
        </p>
      </form>
    </AuthLayout>
  );
}
