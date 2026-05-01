import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MODULES } from "@/lib/modules";
import { Plus, Trash2, Image as ImageIcon, Save } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/novidades")({
  head: () => ({ meta: [{ title: "Admin — Novidades" }] }),
  component: AdminNovidadesPage,
});

interface Form {
  id?: string;
  title: string;
  body_md: string;
  category: "feature" | "fix" | "beta" | "exclusive" | "announcement";
  module_id: string | "";
  media_url: string;
  media_type: "image" | "video" | "";
  target_tenant_id: string | "";
}

const EMPTY: Form = {
  title: "", body_md: "", category: "feature",
  module_id: "", media_url: "", media_type: "", target_tenant_id: "",
};

const MOCK_TENANTS = [
  { id: "tenant-1", name: "Acme Ltda" },
  { id: "tenant-2", name: "Mercearia do Bairro" },
  { id: "tenant-3", name: "Distribuidora Sol" },
];

const INITIAL_ITEMS: Form[] = [
  {
    id: "ann-1",
    title: "Novo: Módulo de Devoluções em beta",
    body_md: "Já está disponível para todos os clientes a primeira versão do programa Devoluções Pro. Teste por 7 dias.",
    category: "beta",
    module_id: "",
    media_url: "",
    media_type: "",
    target_tenant_id: "",
  },
  {
    id: "ann-2",
    title: "Atualização do Estoque Pro",
    body_md: "Agora com suporte a múltiplas filiais e relatórios consolidados.",
    category: "feature",
    module_id: "estoque",
    media_url: "",
    media_type: "",
    target_tenant_id: "",
  },
];

function AdminNovidadesPage() {
  const [items, setItems] = useState<Form[]>(INITIAL_ITEMS);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error] = useState<string | null>(null);

  const submit = () => {
    if (!form.title) return;
    if (form.id) {
      setItems((arr) => arr.map((it) => (it.id === form.id ? { ...form } : it)));
    } else {
      setItems((arr) => [{ ...form, id: `ann-${Date.now()}` }, ...arr]);
    }
    setForm(EMPTY);
  };

  const remove = (id: string) => {
    if (!confirm("Excluir esta novidade?")) return;
    setItems((arr) => arr.filter((it) => it.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Novidades</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Publique changelog, features e avisos. Use "exclusive" + tenant alvo pra entrega personalizada.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 mb-8">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> {form.id ? "Editando" : "Nova publicação"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Título">
            <input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <select className={INPUT} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Form["category"] })}>
              <option value="feature">Novidade (feature)</option>
              <option value="exclusive">Exclusivo pra você</option>
              <option value="beta">Beta</option>
              <option value="fix">Correção</option>
              <option value="announcement">Aviso</option>
            </select>
          </Field>
          <Field label="Programa (opcional)">
            <select className={INPUT} value={form.module_id} onChange={(e) => setForm({ ...form, module_id: e.target.value })}>
              <option value="">— geral —</option>
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Tenant alvo (vazio = todos)">
            <select className={INPUT} value={form.target_tenant_id} onChange={(e) => setForm({ ...form, target_tenant_id: e.target.value })}>
              <option value="">— todos os clientes —</option>
              {MOCK_TENANTS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="URL de mídia (opcional)">
            <div className="flex gap-2">
              <input className={INPUT + " flex-1"} placeholder="https://..." value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} />
              <select className={INPUT} value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value as Form["media_type"] })}>
                <option value="image">imagem</option>
                <option value="video">vídeo</option>
              </select>
            </div>
          </Field>
        </div>

        <Field label="Conteúdo">
          <textarea
            rows={6}
            className={INPUT + " w-full"}
            placeholder="O que mudou? Use quebras de linha à vontade."
            value={form.body_md}
            onChange={(e) => setForm({ ...form, body_md: e.target.value })}
          />
        </Field>

        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          {form.id && (
            <button onClick={() => setForm(EMPTY)} className="text-sm text-zinc-400 hover:text-white px-3 py-1.5">
              Cancelar
            </button>
          )}
          <button
            onClick={submit}
            disabled={!form.title}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-semibold text-sm hover:bg-amber-400 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {form.id ? "Atualizar" : "Publicar"}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">Nada publicado ainda.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 flex items-center gap-3">
              {it.media_url ? (
                <img src={it.media_url} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-zinc-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{it.title}</p>
                <p className="text-xs text-zinc-500">
                  {it.category}{it.module_id ? ` · ${it.module_id}` : ""}{it.target_tenant_id ? " · direcionado" : ""}
                </p>
              </div>
              <button onClick={() => setForm(it)} className="text-xs text-zinc-300 hover:text-white px-2 py-1">Editar</button>
              <button
                onClick={() => it.id && remove(it.id)}
                className="text-rose-400 hover:bg-rose-500/10 rounded p-1.5"
                aria-label="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

const INPUT = "px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:border-zinc-700";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-400 block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
