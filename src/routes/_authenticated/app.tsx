import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { MODULES } from "@/lib/modules";
import { firstName, greetingFor } from "@/lib/workspace-theme";
import { ArrowRight, Lock, Sparkles, Activity, Layers, Zap } from "lucide-react";
import { RevealStagger, RevealItem } from "@/components/Reveal";
import { StartTrialButton, TrialBadge } from "@/components/workspace/TrialControls";
import { EmptyStateRecommendations } from "@/components/workspace/EmptyStateRecommendations";

type AppSearch = { intent?: string };

export const Route = createFileRoute("/_authenticated/app")({
  validateSearch: (search: Record<string, unknown>): AppSearch => ({
    intent: typeof search.intent === "string" ? search.intent : undefined,
  }),
  head: () => ({ meta: [{ title: "Início — Workspace" }] }),
  component: HomePortal,
});

function HomePortal() {
  const { user } = useAuth();
  const { loading, tenantName, fullName, branding, access, announcements, unreadIds, startTrial } = useWorkspace();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const handledIntent = useRef<string | null>(null);

  // Auto-iniciar trial e redirecionar quando vem com ?intent=
  useEffect(() => {
    if (loading) return;
    const intent = search.intent;
    if (!intent || handledIntent.current === intent) return;
    const mod = MODULES.find((m) => m.id === intent);
    if (!mod || mod.status === "coming_soon") return;
    handledIntent.current = intent;

    const current = access.get(intent);

    const goToProgram = () => {
      navigate({ to: "/app/programas/$slug", params: { slug: intent }, replace: true });
    };

    if (current === "active" || current === "trial") {
      goToProgram();
      return;
    }
    startTrial(intent).catch(() => {}).finally(() => { goToProgram(); });
  }, [loading, search.intent, access, startTrial, navigate]);

  const display = firstName(fullName ?? user?.email ?? "");
  const greeting = greetingFor();
  const workspaceLabel = branding.workspace_name || tenantName || "Workspace";

  if (loading) return <PortalSkeleton />;

  const activeModules = MODULES.filter(
    (m) => access.get(m.id) === "active" || access.get(m.id) === "trial",
  );
  const lockedModules = MODULES.filter(
    (m) => !["active", "trial"].includes(access.get(m.id) ?? "blocked"),
  );

  // Mapa: módulo → tem novidade não lida?
  const moduleHasUpdate = new Set(
    announcements
      .filter((a) => a.module_id && unreadIds.has(a.id))
      .map((a) => a.module_id as string)
  );

  const totalActive = activeModules.length;
  const totalAvailable = MODULES.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* HERO editorial */}
      <section className="relative mb-12 overflow-hidden rounded-3xl ws-card p-8 sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--ws-primary)) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(var(--ws-accent)) 0%, transparent 70%)" }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 ws-primary-text mb-4">
            <span className="inline-flex h-1.5 w-1.5 rounded-full ws-primary-bg animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              {greeting}{display ? `, ${display}` : ""}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight ws-text leading-[1.05]">
            {workspaceLabel}
            <span className="block text-base sm:text-lg font-normal ws-text-muted mt-3 max-w-2xl">
              Sua operação inteira em um só lugar. Acesse os programas ativos abaixo
              e ative novos quando fizer sentido para o seu negócio.
            </span>
          </h1>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            <HeroStat icon={Activity} label="Programas ativos" value={`${totalActive}`} />
            <HeroStat icon={Layers} label="Disponíveis" value={`${totalAvailable}`} />
            <HeroStat icon={Zap} label="Status" value="Operacional" valueClass="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </section>

      {/* Estado vazio inteligente */}
      {activeModules.length === 0 && (
        <section className="mb-12">
          <EmptyStateRecommendations />
        </section>
      )}

      {/* Ativos */}
      {activeModules.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            title="Seus programas"
            count={activeModules.length}
            subtitle="Programas ativos da sua operação"
          />
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.06} amount={0.1}>
            {activeModules.map((m) => (
              <RevealItem key={m.id}>
                <ActiveProgramCard module={m} hasUpdate={moduleHasUpdate.has(m.id)} />
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}

      {/* Bloqueados */}
      {lockedModules.length > 0 && (
        <section>
          <SectionHeading
            title="Disponíveis para ativar"
            count={lockedModules.length}
            subtitle="Teste 7 dias grátis ou faça upgrade quando fizer sentido"
          />
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.05} amount={0.1}>
            {lockedModules.map((m) => (
              <RevealItem key={m.id}>
                <LockedProgramCard module={m} />
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl ws-surface-2 px-3 py-3 sm:px-4 sm:py-3.5 border ws-border" style={{ borderWidth: 1 }}>
      <div className="flex items-center gap-1.5 ws-text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={"text-lg sm:text-xl font-semibold ws-text mt-1 " + (valueClass ?? "")}>{value}</p>
    </div>
  );
}

function SectionHeading({
  title, count, subtitle,
}: { title: string; count: number; subtitle: string; }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold ws-text">{title}</h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full ws-surface-2 ws-text-muted">
            {count}
          </span>
        </div>
        <p className="text-xs ws-text-muted mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

type ModuleType = (typeof MODULES)[number];

function ActiveProgramCard({ module: m, hasUpdate }: { module: ModuleType; hasUpdate: boolean }) {
  const Icon = m.icon;

  return (
    <Link
      to="/app/programas/$slug"
      params={{ slug: m.id }}
      className="ws-card group overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col relative"
    >
      <div className="aspect-[16/10] ws-surface-2 relative overflow-hidden border-b ws-border" style={{ borderBottomWidth: 1 }}>
        <ProgramLivePreview slug={m.id} />
        <TrialBadge moduleId={m.id} />
        {hasUpdate && (
          <span
            className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full text-white text-[10px] font-bold px-2 py-1 shadow-md"
            style={{ backgroundColor: "rgb(var(--ws-primary))" }}
          >
            <Sparkles className="h-3 w-3" />
            Novo
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center ws-primary-bg text-white shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold ws-text truncate">{m.name}</h3>
            <p className="text-xs ws-text-muted line-clamp-2 mt-1">{m.short}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium ws-primary-text inline-flex items-center gap-1.5 group-hover:gap-2 transition-all">
            Abrir programa
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function LockedProgramCard({ module: m }: { module: ModuleType }) {
  const Icon = m.icon;
  const comingSoon = m.status === "coming_soon";
  return (
    <div className="ws-card ws-locked-card flex flex-col">
      <div className="ws-locked-blur">
        <div className="aspect-[16/10] ws-surface-2 border-b ws-border" style={{ borderBottomWidth: 1 }}>
          <ProgramLivePreview slug={m.id} />
        </div>
        <div className="p-5">
          <div className="h-9 w-9 rounded-lg ws-surface-2 flex items-center justify-center">
            <Icon className="h-4 w-4 ws-text-muted" />
          </div>
          <h3 className="font-semibold ws-text mt-3">{m.name}</h3>
          <p className="text-xs ws-text-muted mt-1 line-clamp-2">{m.short}</p>
        </div>
      </div>
      <div className="ws-locked-overlay px-5">
        <div className="flex items-center gap-2 text-xs ws-text-muted">
          {comingSoon ? (<><Sparkles className="h-3.5 w-3.5" /> Em breve</>) : (<><Lock className="h-3.5 w-3.5" /> Programa bloqueado</>)}
        </div>
        <p className="text-sm font-semibold ws-text text-center px-4">{m.name}</p>
        {!comingSoon && <StartTrialButton module={m} />}
      </div>
    </div>
  );
}

function ProgramLivePreview({ slug }: { slug: string }) {
  const src = `/apps/${slug}/preview`;
  return (
    <iframe
      src={src}
      title={`Preview ${slug}`}
      className="w-full h-full pointer-events-none select-none"
      style={{ border: 0, transform: "scale(0.85)", transformOrigin: "top left", width: "117.65%", height: "117.65%" }}
      loading="lazy"
    />
  );
}

function PortalSkeleton() {
  return (
    <div className="max-w-7xl mx-auto" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando workspace...</span>
      <div className="h-4 w-40 skeleton-shimmer rounded mb-3" />
      <div className="h-8 w-72 skeleton-shimmer rounded mb-3" />
      <div className="h-4 w-96 skeleton-shimmer rounded mb-10" />
      <div className="h-5 w-48 skeleton-shimmer rounded mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ws-card overflow-hidden">
            <div className="aspect-[16/10] skeleton-shimmer" />
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                  <div className="h-3 w-full skeleton-shimmer rounded" />
                </div>
              </div>
              <div className="h-3 w-1/3 skeleton-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
