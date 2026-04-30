import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/novidades")({
  head: () => ({ meta: [{ title: "Novidades" }] }),
  component: NovidadesPage,
});

interface Item {
  id: string;
  title: string;
  body_md: string | null;
  category: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

const CAT_LABEL: Record<string, string> = {
  feature: "Novidade",
  fix: "Correção",
  beta: "Beta",
  exclusive: "Exclusivo",
  announcement: "Aviso",
};

function NovidadesPage() {
  const { markAllRead } = useWorkspace();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id,title,body_md,category,media_url,media_type,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setItems((data ?? []) as Item[]);
      setLoading(false);
      markAllRead?.();
    })();
  }, [markAllRead]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 ws-primary-text" />
        <h1 className="text-2xl font-semibold ws-text">Novidades</h1>
      </div>

      {loading ? (
        <p className="ws-text-muted text-sm">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="ws-text-muted text-sm">Nada por aqui ainda.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n.id} className="ws-surface ws-border border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ws-surface-2 ws-text-muted">
                  {CAT_LABEL[n.category] ?? n.category}
                </span>
                <span className="text-xs ws-text-muted">
                  {new Date(n.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h2 className="text-lg font-semibold ws-text mb-1">{n.title}</h2>
              {n.body_md && (
                <p className="text-sm ws-text-muted whitespace-pre-wrap">{n.body_md}</p>
              )}
              {n.media_url && n.media_type === "image" && (
                <img src={n.media_url} alt="" className="mt-3 rounded-lg max-h-80" />
              )}
              {n.media_url && n.media_type === "video" && (
                <video src={n.media_url} controls className="mt-3 rounded-lg max-h-80 w-full" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
