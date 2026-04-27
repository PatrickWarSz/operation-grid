import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { MODULES } from "@/lib/modules";
import { Plus, Trash2, Image as ImageIcon, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/novidades")({
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

function AdminNovidadesPage() {
  const { isAdmin, refreshAnnouncements } = useWorkspace();
  const [items, setItems] = useState<Form[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    void load();
    void loadTenants();
  }, [isAdmin]);

  async function load() {
    const sb = supabase as unknown as { from: (t: string) => any };
    const { data } = await sb.from("announcements").select("*").order("published_at", { ascending: false });
    setItems((data as Form[]) ?? []);
  }
  async function loadTenants() {
    const { data } = await supabase.from("tenants").select("id, name").order("name");
    setTenants((data as { id: string; name: string }[]) ?? []);
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto ws-card p-8 text-center">
        <p className="text-sm ws-text">Acesso restrito.</p>
        <p className="text-xs ws-text-muted mt-2">
          Você precisa ter o papel <code>admin</code> em <code>user_roles</code>.
        </p>
      </div>
    );
  }

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const sb = supabase as unknown as { from: (t: string) => any };
      const payload = {
        title: form.title,
        body_md: form.body_md,
        category: form.category,
        module_id: form.module_id || null,
        media_url: form.media_url || null,
        media_type: form.media_url ? (form.media_type || "image") : null,
        target_tenant_id: form.target_tenant_id || null,
      };
      const { error } = form.id
        ? await sb.from("announcements").update(payload).eq("id", form.id)
        : await sb.from("announcements").insert(payload);
      if (error) throw error;
      setForm(EMPTY);
      await load();
      await refreshAnnouncements();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta novidade?")) return;
    const sb = supabase as unknown as { from: (t: string) => any };
    await sb.from("announcements").delete().eq("id", id);
    await load();
    await refreshAnnouncements();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest ws-primary-text mb-2">Admin</p>
        <h1 className="text-2xl font-semibold ws-text">Gerenciar Novidades</h1>
        <p className="text-sm ws-text-muted mt-1">
          Publique changelog, features e avisos. Use "exclusive" + tenant alvo para entrega personalizada.
        </p>
      </header>

      {/* Form */}
      <section className="ws-card p-6 mb-8">
        <h2 className="text-sm font-semibold ws-text mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> {form.id ? "Editando" : "Nova publicação"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Título">
            <input className="ws-input w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <select className="ws-input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Form["category"] })}>
              <option value="feature">Novidade (feature)</option>
              <option value="exclusive">Exclusivo pra você</option>
              <option value="beta">Beta</option>
              <option value="fix">Correção</option>
              <option value="announcement">Aviso</option>
            </select>
          </Field>
          <Field label="Programa (opcional)">
            <select className="ws-input w-full" value={form.module_id} onChange={(e) => setForm({ ...form, module_id: e.target.value })}>
              <option value="">— geral —</option>
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Tenant alvo (vazio = todos)">
            <select className="ws-input w-full" value={form.target_tenant_id} onChange={(e) => setForm({ ...form, target_tenant_id: e.target.value })}>
              <option value="">— todos os clientes —</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="URL de mídia (opcional)">
            <div className="flex gap-2">
              <input className="ws-input flex-1" placeholder="https://..." value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} />
              <select className="ws-input" value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value as Form["media_type"] })}>
                <option value="image">imagem</option>
                <option value="video">vídeo</option>
              </select>
            </div>
          </Field>
        </div>

        <Field label="Conteúdo">
          <textarea
            rows={6}
            className="ws-input w-full"
            placeholder="O que mudou? Use quebras de linha à vontade."
            value={form.body_md}
            onChange={(e) => setForm({ ...form, body_md: e.target.value })}
          />
        </Field>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          {form.id && (
            <button onClick={() => setForm(EMPTY)} className="ws-btn-ghost text-sm">Cancelar</button>
          )}
          <button
            onClick={submit}
            disabled={saving || !form.title}
            className="ws-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : form.id ? "Atualizar" : "Publicar"}
          </button>
        </div>
      </section>

      {/* Lista */}
      <section className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm ws-text-muted text-center py-8">Nada publicado ainda.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="ws-card p-4 flex items-center gap-4">
              {it.media_url ? (
                <img src={it.media_url} alt="" className="h-12 w-12 rounded-lg object-cover ws-surface-2" />
              ) : (
                <div className="h-12 w-12 rounded-lg ws-surface-2 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 ws-text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium ws-text truncate">{it.title}</p>
                <p className="text-xs ws-text-muted">
                  {it.category} {it.module_id ? `· ${it.module_id}` : ""} {it.target_tenant_id ? "· direcionado" : ""}
                </p>
              </div>
              <button onClick={() => setForm(it)} className="ws-btn-ghost text-xs">Editar</button>
              <button
                onClick={() => it.id && remove(it.id)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg p-2"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium ws-text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
