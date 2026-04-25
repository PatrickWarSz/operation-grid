import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MODULES } from "@/lib/modules";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowRight, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [{ title: "Portal — Hub Nexus" }],
  }),
  component: AppPortal,
});

interface ModuleAccess {
  module_id: string;
  status: "active" | "trial" | "blocked";
}

function AppPortal() {
  const { user } = useAuth();
  const [access, setAccess] = useState<ModuleAccess[]>([]);
  const [tenantName, setTenantName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // pega o tenant do usuário via profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, tenants(name)")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      // @ts-expect-error — tenants vem como objeto da relação
      const name = profile?.tenants?.name as string | undefined;
      if (name) setTenantName(name);

      if (profile?.tenant_id) {
        const { data: rows } = await supabase
          .from("tenant_module_access")
          .select("module_id, status")
          .eq("tenant_id", profile.tenant_id);
        if (!cancelled && rows) setAccess(rows as ModuleAccess[]);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const accessMap = new Map(access.map((a) => [a.module_id, a.status]));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          Bem-vindo de volta
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
          {tenantName ? `Hub ${tenantName}` : "Seu Hub"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl">
          Acesse os programas da sua operação. Programas bloqueados podem ser ativados a qualquer momento.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[5/3] rounded-2xl border border-border bg-card-elevated/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => {
            const status = accessMap.get(m.id) ?? "blocked";
            const isActive = status === "active" || status === "trial";
            const Icon = m.icon;
            const comingSoon = m.status === "coming_soon";

            return (
              <div
                key={m.id}
                className={
                  "relative rounded-2xl border p-5 transition-all " +
                  (isActive
                    ? "border-primary/30 bg-card-elevated hover:border-primary/60 hover:shadow-elevated"
                    : "border-border bg-locked/40")
                }
              >
                {status === "trial" && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary text-[10px] font-mono px-2 py-0.5">
                    <Clock className="h-3 w-3" />
                    trial
                  </span>
                )}
                {comingSoon && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5">
                    em breve
                  </span>
                )}

                <div className={"inline-flex h-10 w-10 items-center justify-center rounded-xl " + (isActive ? "bg-primary/15 text-primary" : "bg-muted text-locked-foreground")}>
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.short}</p>

                <div className="mt-5 flex items-center justify-between">
                  {isActive && !comingSoon ? (
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                      Abrir programa
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : comingSoon ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                      Em desenvolvimento
                    </span>
                  ) : (
                    <Link
                      to="/"
                      hash="planos"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Ativar este programa
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
