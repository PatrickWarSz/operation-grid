import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWorkspace, type AnnouncementRow } from "@/hooks/useWorkspace";
import { MODULES } from "@/lib/modules";
import { Sparkles, Wrench, FlaskConical, Gift, Megaphone, Filter } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/app/novidades")({
  head: () => ({ meta: [{ title: "Novidades — Workspace" }] }),
  component: NovidadesPage,
});

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "feature", label: "Novidades", icon: Sparkles },
  { id: "exclusive", label: "Exclusivo pra você", icon: Gift },
  { id: "beta", label: "Beta", icon: FlaskConical },
  { id: "fix", label: "Correções", icon: Wrench },
  { id: "announcement", label: "Avisos", icon: Megaphone },
] as const;

function NovidadesPage() {
  const { announcements, unreadIds, markAnnouncementRead } = useWorkspace();
  const [cat, setCat] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (moduleFilter !== "all" && a.module_id !== moduleFilter) return false;
      return true;
    });
  }, [announcements, cat, moduleFilter]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest ws-primary-text mb-2">Novidades</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight ws-text">
          O que há de novo no seu workspace
        </h1>
        <p className="text-sm ws-text-muted mt-2 max-w-2xl">
          Atualizações, novos recursos e features liberadas especialmente pra você.
        </p>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          const Icon = "icon" in c ? c.icon : null;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1.5"
              style={{
                borderColor: active ? "rgb(var(--ws-primary))" : "rgb(var(--ws-border))",
                backgroundColor: active ? "rgb(var(--ws-primary) / 0.1)" : "transparent",
                color: active ? "rgb(var(--ws-primary))" : "rgb(var(--ws-text-muted))",
              }}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-3.5 w-3.5 ws-text-muted" />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="ws-input text-xs py-1.5"
        >
          <option value="all">Todos os programas</option>
          {MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="ws-card p-12 text-center">
          <p className="text-sm ws-text-muted">Nada por aqui ainda. Volte em breve.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((a, i) => (
            <AnnouncementCard
              key={a.id}
              a={a}
              isUnread={unreadIds.has(a.id)}
              index={i}
              onRead={() => markAnnouncementRead(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const CAT_META: Record<AnnouncementRow["category"], { label: string; color: string; icon: typeof Sparkles }> = {
  feature: { label: "Novidade", color: "rgb(var(--ws-primary))", icon: Sparkles },
  fix: { label: "Correção", color: "#10b981", icon: Wrench },
  beta: { label: "Beta", color: "#f59e0b", icon: FlaskConical },
  exclusive: { label: "Exclusivo pra você", color: "#ec4899", icon: Gift },
  announcement: { label: "Aviso", color: "rgb(var(--ws-text-muted))", icon: Megaphone },
};

function AnnouncementCard({
  a, isUnread, index, onRead,
}: {
  a: AnnouncementRow;
  isUnread: boolean;
  index: number;
  onRead: () => void;
}) {
  const meta = CAT_META[a.category];
  const Icon = meta.icon;
  const moduleName = a.module_id ? MODULES.find((m) => m.id === a.module_id)?.name : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="ws-card overflow-hidden"
    >
      {a.media_url && a.media_type === "image" && (
        <div className="aspect-[16/8] ws-surface-2 overflow-hidden">
          <img src={a.media_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {a.media_url && a.media_type === "video" && (
        <div className="aspect-[16/8] ws-surface-2 overflow-hidden">
          <video src={a.media_url} controls className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
          {moduleName && (
            <span className="text-[11px] ws-text-muted px-2 py-0.5 rounded-full ws-surface-2">
              {moduleName}
            </span>
          )}
          {a.target_tenant_id && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#ec48991f", color: "#ec4899" }}
            >
              Liberado pra você
            </span>
          )}
          {isUnread && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "rgb(var(--ws-primary))" }}
            >
              NOVO
            </span>
          )}
          <span className="text-[11px] ws-text-muted ml-auto">
            {new Date(a.published_at).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </span>
        </div>

        <h2 className="text-lg font-semibold ws-text">{a.title}</h2>
        <div className="text-sm ws-text-muted mt-2 whitespace-pre-wrap leading-relaxed">
          {a.body_md}
        </div>

        {isUnread && (
          <button
            onClick={onRead}
            className="mt-4 text-xs font-medium ws-primary-text hover:underline"
          >
            Marcar como lido
          </button>
        )}
      </div>
    </motion.article>
  );
}
