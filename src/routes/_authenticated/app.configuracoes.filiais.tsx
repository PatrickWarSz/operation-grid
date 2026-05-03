import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Plus, Star, Trash2, Loader2, Users } from "lucide-react";
import { useUnits, type UnitRow } from "@/hooks/useUnits";

type FiliaisSearch = { novo?: number };

export const Route = createFileRoute("/_authenticated/app/configuracoes/filiais")({
  validateSearch: (search: Record<string, unknown>): FiliaisSearch => ({
    novo: search.novo === 1 || search.novo === "1" ? 1 : undefined,
  }),
  head: () => ({ meta: [{ title: "Filiais — Workspace" }] }),
  component: FiliaisPage,
});

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "filial"
  );
}

function FiliaisPage() {
  const { units, maxUnits, canCreateUnit, refresh, loading, createUnit, deleteUnit } = useUnits();
  const search = Route.useSearch();
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (search.novo) setShowCreate(true);
  }, [search.novo]);

  const limitLabel = maxUnits === Infinity ? "∞" : String(maxUnits);
  const atLimit = units.length >= maxUnits;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await createUnit(name);
    setSubmitting(false);
    setName("");
    setShowCreate(false);
    await refresh();
  };

  const handleDelete = async (u: UnitRow) => {
    if (u.is_primary) return;
    if (!confirm(`Excluir filial "${u.name}"? Esta ação não pode ser desfeita.`)) return;
    await deleteUnit(u.id);
    await refresh();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <Link to="/app/configuracoes" className="text-xs ws-text-muted hover:ws-text">
          ← Configurações
        </Link>
        <h1 className="text-2xl font-semibold ws-text mt-2">Filiais</h1>
        <p className="text-sm ws-text-muted mt-1">
          Gerencie unidades da sua empresa. Cada filial tem seus próprios dados, mas compartilha o mesmo plano.
        </p>
      </header>

      <div className="ws-card p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium ws-text">
            {units.length} de {limitLabel} filiais
          </p>
          <p className="text-xs ws-text-muted mt-0.5">
            {atLimit
              ? "Você atingiu o limite do seu plano."
              : "Crie filiais para separar dados de cada unidade."}
          </p>
        </div>
        {atLimit && maxUnits !== Infinity && (
          <span className="text-[11px] ws-text-muted">Limite do plano atingido</span>
        )}
      </div>

      <div className="ws-card overflow-hidden mb-6">
        {loading ? (
          <div className="p-8 text-center text-xs ws-text-muted">
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Carregando filiais...
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-xs ws-text-muted">Nenhuma filial.</div>
        ) : (
          <ul className="divide-y ws-border" style={{ borderColor: "rgb(var(--ws-border))" }}>
            {units.map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg ws-surface-2 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 ws-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium ws-text truncate">{u.name}</p>
                    {u.is_primary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ws-surface-2 ws-text-muted">
                        <Star className="h-2.5 w-2.5" /> Matriz
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] ws-text-muted mt-0.5 font-mono">{u.slug}</p>
                </div>
                {!u.is_primary && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="ws-btn-ghost p-2"
                    aria-label={`Excluir ${u.name}`}
                    title="Excluir filial"
                  >
                    <Trash2 className="h-4 w-4 ws-text-muted" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!showCreate ? (
        <button
          onClick={() => setShowCreate(true)}
          disabled={!canCreateUnit}
          className="ws-btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Nova filial
        </button>
      ) : (
        <form onSubmit={handleCreate} className="ws-card p-4 space-y-3">
          <div>
            <label className="text-xs font-medium ws-text">Nome da filial</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Filial São Paulo"
              className="w-full mt-1.5 px-3 py-2 rounded-md text-sm ws-surface-2 ws-text border ws-border outline-none focus:ring-2"
              style={{ borderColor: "rgb(var(--ws-border))" }}
              required
              maxLength={60}
            />
            {name && (
              <p className="text-[11px] ws-text-muted mt-1 font-mono">slug: {slugify(name)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="ws-btn-primary text-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Criar filial"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setName("");
              }}
              className="ws-btn-ghost text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 ws-card p-4 flex items-start gap-3">
        <Users className="h-4 w-4 ws-text-muted mt-0.5" />
        <div>
          <p className="text-sm font-medium ws-text">Membros por filial</p>
          <p className="text-xs ws-text-muted mt-1">
            Hoje todos os usuários do tenant têm acesso a todas as filiais. Permissão granular por
            usuário chega na próxima fase.
          </p>
        </div>
      </div>
    </div>
  );
}
