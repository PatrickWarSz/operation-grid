import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ArrowLeft, Lock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildSatelliteUrl, isAllowedSatelliteUrl } from "@/lib/satellite-handoff";

export const Route = createFileRoute("/_authenticated/app/programas/$slug")({
  loader: ({ params }) => {
    const m = MODULES.find((x) => x.id === params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.module.name ?? "Programa"} — Workspace` }],
  }),
  component: ProgramaDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <p className="ws-text-muted text-sm">Programa não encontrado.</p>
      <Link to="/app" className="ws-btn-primary text-xs mt-4 inline-flex">
        Voltar ao início
      </Link>
    </div>
  ),
});

function ProgramaDetail() {
  const { module: m } = Route.useLoaderData();
  const { access } = useWorkspace();
  const status = access.get(m.id) ?? "blocked";
  const isActive = status === "active" || status === "trial";
  const Icon = m.icon;

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-xs ws-text-muted hover:ws-text mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </Link>

      <header className="flex items-start gap-4 mb-6">
        <div
          className={
            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 " +
            (isActive ? "ws-primary-bg text-white" : "ws-surface-2")
          }
        >
          <Icon className={"h-6 w-6 " + (isActive ? "" : "ws-text-muted")} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold ws-text">{m.name}</h1>
          <p className="text-sm ws-text-muted mt-1">{m.description}</p>
        </div>
      </header>

      {!isActive ? (
        <div className="ws-card p-10 text-center">
          <Lock className="h-8 w-8 ws-text-muted mx-auto" />
          <h2 className="font-semibold ws-text mt-3">Programa bloqueado</h2>
          <p className="text-sm ws-text-muted mt-1 max-w-md mx-auto">
            Ative este programa para liberar o acesso da sua equipe.
          </p>
          <Link to="/" hash="planos" className="ws-btn-primary text-sm mt-5 inline-flex">
            Ver planos
          </Link>
        </div>
      ) : m.externalUrl && isAllowedSatelliteUrl(m.externalUrl) ? (
        <ExternalSatellitePanel module={m} />
      ) : (
        <div className="ws-card overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b ws-border" style={{ borderBottomWidth: 1 }}>
            <span className="text-xs ws-text-muted px-2">/apps/{m.id}</span>
            <a
              href={`/apps/${m.id}`}
              target="_blank"
              rel="noreferrer"
              className="ws-btn-ghost text-xs inline-flex items-center gap-1.5"
            >
              Abrir em nova guia
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <iframe
            src={`/apps/${m.id}`}
            title={m.name}
            className="w-full"
            style={{ border: 0, height: "calc(100vh - 280px)", minHeight: 500 }}
          />
        </div>
      )}
    </div>
  );
}

function ExternalSatellitePanel({ module: m }: { module: typeof MODULES[number] }) {
  const open = async () => {
    const { data } = await supabase.auth.getSession();
    const url = buildSatelliteUrl(m.externalUrl!, data.session);
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="ws-card p-10 text-center">
      <ExternalLink className="h-8 w-8 ws-text-muted mx-auto" />
      <h2 className="font-semibold ws-text mt-3">{m.name} abre em nova guia</h2>
      <p className="text-sm ws-text-muted mt-1 max-w-md mx-auto">
        Este programa roda em seu próprio endereço. Sua sessão Hub vai junto automaticamente —
        você não precisa entrar de novo.
      </p>
      <button onClick={open} className="ws-btn-primary text-sm mt-5 inline-flex items-center gap-1.5">
        Abrir {m.name}
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
      {m.landingUrl && (
        <div className="mt-4">
          <a
            href={m.landingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs ws-text-muted hover:ws-text underline"
          >
            Conhecer página completa
          </a>
        </div>
      )}
    </div>
  );
}
