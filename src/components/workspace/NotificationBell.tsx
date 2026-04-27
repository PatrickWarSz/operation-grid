import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ArrowRight, Sparkles, Wrench, FlaskConical, Gift, Megaphone } from "lucide-react";
import { useWorkspace, type AnnouncementRow } from "@/hooks/useWorkspace";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_META: Record<AnnouncementRow["category"], { label: string; icon: typeof Sparkles; color: string }> = {
  feature: { label: "Novidade", icon: Sparkles, color: "rgb(var(--ws-primary))" },
  fix: { label: "Correção", icon: Wrench, color: "#10b981" },
  beta: { label: "Beta", icon: FlaskConical, color: "#f59e0b" },
  exclusive: { label: "Exclusivo pra você", icon: Gift, color: "#ec4899" },
  announcement: { label: "Aviso", icon: Megaphone, color: "rgb(var(--ws-text-muted))" },
};

export function NotificationBell() {
  const { announcements, unreadIds, markAnnouncementRead } = useWorkspace();
  const [open, setOpen] = useState(false);
  const unread = unreadIds.size;
  const recent = announcements.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative ws-btn-ghost p-2"
          aria-label={`Notificações${unread > 0 ? `, ${unread} não lidas` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "rgb(var(--ws-primary))" }}
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 ws-card border"
        style={{ backgroundColor: "rgb(var(--ws-surface))", borderColor: "rgb(var(--ws-border))" }}
      >
        <div className="p-4 border-b ws-border" style={{ borderBottomWidth: 1 }}>
          <p className="text-sm font-semibold ws-text">Notificações</p>
          <p className="text-xs ws-text-muted mt-0.5">
            {unread > 0 ? `${unread} novidade${unread > 1 ? "s" : ""} pra você` : "Tudo em dia"}
          </p>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {recent.length === 0 ? (
              <div className="p-8 text-center text-xs ws-text-muted">
                Nenhuma novidade ainda.
              </div>
            ) : (
              recent.map((a) => {
                const isUnread = unreadIds.has(a.id);
                const meta = CATEGORY_META[a.category];
                const Icon = meta.icon;
                return (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      markAnnouncementRead(a.id);
                      setOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b ws-border flex gap-3"
                    style={{ borderBottomWidth: 1 }}
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-medium ws-text line-clamp-2 flex-1">{a.title}</p>
                        {isUnread && (
                          <span
                            className="h-2 w-2 rounded-full shrink-0 mt-1.5"
                            style={{ backgroundColor: "rgb(var(--ws-primary))" }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] ws-text-muted mt-0.5">
                        {meta.label} · {timeAgo(a.published_at)}
                      </p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <Link
          to="/app/novidades"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 p-3 text-xs font-medium ws-primary-text hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Ver todas as novidades <ArrowRight className="h-3 w-3" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}
