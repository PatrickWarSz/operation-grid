import { Link } from "@tanstack/react-router";
import { Hexagon, ArrowLeft } from "lucide-react";
import { AuthShowcase } from "./AuthShowcase";

export function AuthLayout({
  title,
  subtitle,
  tagline,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  tagline?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr] bg-background">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 lg:px-14 lg:py-12">
        <div className="flex items-center justify-between">
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
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-sm text-center text-muted-foreground">{footer}</div>}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center font-mono">
          Protegido por criptografia ponta-a-ponta · Multi-tenant
        </p>
      </div>

      {/* Showcase side */}
      <div className="hidden lg:block relative border-l border-border">
        <AuthShowcase tagline={tagline} />
      </div>
    </div>
  );
}
