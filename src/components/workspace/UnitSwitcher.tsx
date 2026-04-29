import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Check, ChevronDown, Plus, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUnits } from "@/hooks/useUnits";

/**
 * Switcher de filiais (estilo Slack).
 * Aparece no header global. Usa localStorage["hub:active_unit"].
 */
export function UnitSwitcher() {
  const { units, activeUnit, setActiveUnit, maxUnits, canCreateUnit, loading } = useUnits();
  const [open, setOpen] = useState(false);

  if (loading || units.length === 0) return null;

  const label = activeUnit?.name ?? "Selecionar filial";
  const limitLabel = maxUnits === Infinity ? "∞" : String(maxUnits);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="ws-btn-ghost flex items-center gap-2 max-w-[200px] px-2.5 py-1.5"
          aria-label="Trocar filial"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-0 ws-card border"
        style={{ backgroundColor: "rgb(var(--ws-surface))", borderColor: "rgb(var(--ws-border))" }}
      >
        <div className="p-3 border-b ws-border" style={{ borderBottomWidth: 1 }}>
          <p className="text-[10px] uppercase tracking-widest ws-text-muted font-semibold">
            Filiais
          </p>
          <p className="text-xs ws-text-muted mt-0.5">
            {units.length} de {limitLabel} usadas
          </p>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-1">
          {units.map((u) => {
            const active = u.id === activeUnit?.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setActiveUnit(u.id);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2.5"
              >
                <div className="h-7 w-7 rounded-md ws-surface-2 flex items-center justify-center shrink-0">
                  <Building2 className="h-3.5 w-3.5 ws-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium ws-text truncate">{u.name}</p>
                  {u.is_primary && (
                    <p className="text-[10px] ws-text-muted leading-none mt-0.5">
                      Matriz
                    </p>
                  )}
                </div>
                {active && (
                  <Check className="h-4 w-4 shrink-0" style={{ color: "rgb(var(--ws-primary))" }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t ws-border p-1" style={{ borderTopWidth: 1 }}>
          <Link
            to="/app/configuracoes/filiais"
            onClick={() => setOpen(false)}
            className="w-full text-left px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2 text-xs ws-text"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Gerenciar filiais
          </Link>
          {canCreateUnit && (
            <Link
              to="/app/configuracoes/filiais"
              search={{ novo: 1 }}
              onClick={() => setOpen(false)}
              className="w-full text-left px-3 py-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-2 text-xs font-medium"
              style={{ color: "rgb(var(--ws-primary))" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Nova filial
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
