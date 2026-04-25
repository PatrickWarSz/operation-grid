import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Hexagon } from "lucide-react";

export function CtaFinal() {
  return (
    <section className="relative py-24 border-t border-border/60 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-80" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-20 mask-fade-radial" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl border border-primary/40 bg-primary/10 mb-6 shadow-glow">
          <Hexagon className="h-6 w-6 text-primary fill-primary/20" />
        </div>
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
          Pronto para centralizar
          <br />
          <span className="text-gradient-primary">sua operação?</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Junte-se às empresas que pararam de pular entre 5 sistemas diferentes para tomar uma decisão.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              Criar minha conta
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="border-border-strong">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <Hexagon className="h-6 w-6 text-primary fill-primary/10" />
            <span className="font-display text-lg font-semibold">
              Hub<span className="text-primary">Nexus</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            A operação inteira da sua empresa, em um só lugar. Multi-programas, multi-tenant, sob medida.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Produto</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#programas" className="text-foreground/80 hover:text-foreground">Programas</a></li>
            <li><a href="#precos" className="text-foreground/80 hover:text-foreground">Preços</a></li>
            <li><a href="#showcase" className="text-foreground/80 hover:text-foreground">Demonstração</a></li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Conta</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-foreground/80 hover:text-foreground">Entrar</Link></li>
            <li><Link to="/signup" className="text-foreground/80 hover:text-foreground">Criar conta</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Hub Nexus. Todos os direitos reservados.</span>
          <span className="font-mono">v1.0 · multi-tenant ready</span>
        </div>
      </div>
    </footer>
  );
}
