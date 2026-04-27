import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Check, Upload, Loader2, Accessibility } from "lucide-react";
import { setReduceMotionOverride } from "@/hooks/useReducedMotion";

export const Route = createFileRoute("/_authenticated/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Workspace" }] }),
  component: Configuracoes,
});

const PRESETS = [
  { primary: "#0EA5E9", accent: "#6366F1", name: "Sky" },
  { primary: "#10B981", accent: "#0EA5E9", name: "Emerald" },
  { primary: "#F43F5E", accent: "#F59E0B", name: "Rose" },
  { primary: "#8B5CF6", accent: "#EC4899", name: "Violet" },
  { primary: "#F59E0B", accent: "#EF4444", name: "Amber" },
  { primary: "#0F172A", accent: "#3B82F6", name: "Slate" },
];

function Configuracoes() {
  const { branding, saveBranding, tenantId, tenantName } = useWorkspace();
  const [primary, setPrimary] = useState(branding.primary_color);
  const [accent, setAccent] = useState(branding.accent_color);
  const [name, setName] = useState(branding.workspace_name ?? "");
  const [uploading, setUploading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Estado da preferência de motion (3 estados: system | on | off)
  const [motionPref, setMotionPref] = useState<"system" | "on" | "off">(() => {
    if (typeof window === "undefined") return "system";
    const v = window.localStorage.getItem("ws-reduce-motion");
    if (v === "1") return "on";
    if (v === "0") return "off";
    return "system";
  });

  useEffect(() => {
    if (motionPref === "system") setReduceMotionOverride(null);
    else if (motionPref === "on") setReduceMotionOverride(true);
    else setReduceMotionOverride(false);
  }, [motionPref]);

  const handleSave = async () => {
    await saveBranding({
      primary_color: primary,
      accent_color: accent,
      workspace_name: name || null,
    });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2400);
  };

  const handleLogoUpload = async (file: File) => {
    if (!tenantId) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${tenantId}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("tenant-logos").upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("tenant-logos").getPublicUrl(path);
      await saveBranding({ logo_url: pub.publicUrl });
    } catch (e) {
      console.error("Upload error:", e);
      alert("Erro ao enviar a logo. Verifique se o bucket 'tenant-logos' existe.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight ws-text">Configurações do workspace</h1>
        <p className="text-sm ws-text-muted mt-2">
          Personalize a identidade visual do <strong>{tenantName || "seu workspace"}</strong>.
        </p>
      </header>

      {/* Identidade */}
      <section className="ws-card p-6 mb-6">
        <h2 className="font-semibold ws-text mb-1">Identidade</h2>
        <p className="text-xs ws-text-muted mb-5">Logo e nome exibidos no cabeçalho.</p>

        <div className="flex items-start gap-5 flex-wrap">
          <div className="flex flex-col items-center gap-2">
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt="Logo"
                className="h-20 w-20 rounded-xl object-cover ws-surface-2"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl ws-primary-bg text-white flex items-center justify-center text-2xl font-bold">
                {(name || tenantName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f);
              }}
            />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="ws-btn-ghost text-xs inline-flex items-center gap-1.5"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Enviando..." : "Trocar logo"}
            </button>
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="text-xs font-medium ws-text-muted block mb-1.5">Nome do workspace</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tenantName || "Minha empresa"}
              className="ws-input w-full"
            />
            <p className="text-[11px] ws-text-muted mt-1.5">
              Aparece no canto superior esquerdo da sidebar.
            </p>
          </div>
        </div>
      </section>

      {/* Cores */}
      <section className="ws-card p-6 mb-6">
        <h2 className="font-semibold ws-text mb-1">Cores</h2>
        <p className="text-xs ws-text-muted mb-5">Defina a paleta do workspace.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <ColorField label="Cor primária" value={primary} onChange={setPrimary} />
          <ColorField label="Cor de destaque" value={accent} onChange={setAccent} />
        </div>

        <p className="text-xs ws-text-muted mb-2">Ou escolha um preset:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPrimary(p.primary);
                setAccent(p.accent);
              }}
              className="flex items-center gap-1.5 ws-surface-2 hover:opacity-80 px-2.5 py-1.5 rounded-lg text-xs ws-text"
              title={p.name}
            >
              <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
              <span className="h-4 w-4 rounded-full -ml-2" style={{ background: p.accent }} />
              <span className="ml-1">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Acessibilidade */}
      <section className="ws-card p-6 mb-6">
        <div className="flex items-start gap-3 mb-1">
          <Accessibility className="h-5 w-5 ws-primary-text mt-0.5" />
          <div>
            <h2 className="font-semibold ws-text">Acessibilidade</h2>
            <p className="text-xs ws-text-muted mt-0.5">
              Reduza animações e transições para uma experiência mais calma.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([
            { v: "system", label: "Padrão do sistema", desc: "Segue prefers-reduced-motion" },
            { v: "off", label: "Animações ativas", desc: "Visual completo" },
            { v: "on", label: "Reduzir movimento", desc: "Estados estáticos" },
          ] as const).map((opt) => {
            const selected = motionPref === opt.v;
            return (
              <button
                key={opt.v}
                onClick={() => setMotionPref(opt.v)}
                className="text-left rounded-xl p-3 ws-surface-2 transition"
                style={{
                  border: "2px solid",
                  borderColor: selected ? "rgb(var(--ws-primary))" : "transparent",
                }}
              >
                <div className="text-sm font-medium ws-text">{opt.label}</div>
                <div className="text-[11px] ws-text-muted mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {savedAt && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Salvo
          </span>
        )}
        <button onClick={handleSave} className="ws-btn-primary">
          Salvar alterações
        </button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium ws-text-muted block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded cursor-pointer ws-border"
          style={{ borderWidth: 1, padding: 2, background: "transparent" }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ws-input flex-1 font-mono text-xs"
          placeholder="#0EA5E9"
        />
      </div>
    </div>
  );
}
