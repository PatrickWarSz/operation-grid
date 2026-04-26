import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_BRANDING,
  applyWorkspaceBranding,
  getStoredThemeMode,
  setStoredThemeMode,
  type TenantBranding,
  type ThemeMode,
} from "@/lib/workspace-theme";

interface ModuleAccess {
  module_id: string;
  status: "active" | "trial" | "blocked";
}

interface WorkspaceContextValue {
  loading: boolean;
  tenantId: string | null;
  tenantName: string;
  fullName: string | null;
  branding: TenantBranding;
  access: Map<string, "active" | "trial" | "blocked">;
  setMode: (mode: ThemeMode) => void;
  saveBranding: (patch: Partial<TenantBranding>) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("");
  const [fullName, setFullName] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [access, setAccess] = useState<ModuleAccess[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // 1) profile + tenant
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, full_name, tenants(name)")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const p = profile as unknown as {
        tenant_id: string | null;
        full_name: string | null;
        tenants: { name: string } | null;
      } | null;
      const tName = p?.tenants?.name ?? "";
      const tId = p?.tenant_id ?? null;
      setTenantName(tName);
      setTenantId(tId);
      setFullName(p?.full_name ?? null);

      // 2) branding (tabela opcional — se não existir/sem linha, usa default)
      let initialBranding: TenantBranding = { ...DEFAULT_BRANDING };
      if (tId) {
        const { data: brand } = await (supabase as unknown as {
          from: (t: string) => {
            select: (s: string) => {
              eq: (c: string, v: string) => {
                maybeSingle: () => Promise<{ data: Record<string, string | null> | null }>;
              };
            };
          };
        })
          .from("tenant_branding")
          .select("logo_url, primary_color, accent_color, theme_mode, workspace_name")
          .eq("tenant_id", tId)
          .maybeSingle();
        if (brand) {
          initialBranding = {
            logo_url: brand.logo_url ?? null,
            primary_color: brand.primary_color ?? DEFAULT_BRANDING.primary_color,
            accent_color: brand.accent_color ?? DEFAULT_BRANDING.accent_color,
            theme_mode: (brand.theme_mode as ThemeMode) ?? DEFAULT_BRANDING.theme_mode,
            workspace_name: brand.workspace_name ?? null,
          };
        }
      }
      // override do tema pelo localStorage (preferência do device)
      const stored = getStoredThemeMode();
      if (stored) initialBranding.theme_mode = stored;
      setBranding(initialBranding);

      // 3) acesso a módulos
      if (tId) {
        const { data: rows } = await supabase
          .from("tenant_module_access")
          .select("module_id, status")
          .eq("tenant_id", tId);
        if (!cancelled && rows) setAccess(rows as ModuleAccess[]);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // aplica branding no DOM sempre que mudar
  useEffect(() => {
    applyWorkspaceBranding(branding);
  }, [branding]);

  const accessMap = useMemo(
    () => new Map(access.map((a) => [a.module_id, a.status])),
    [access],
  );

  const setMode = (mode: ThemeMode) => {
    setStoredThemeMode(mode);
    setBranding((b) => ({ ...b, theme_mode: mode }));
  };

  const saveBranding = async (patch: Partial<TenantBranding>) => {
    const next = { ...branding, ...patch };
    setBranding(next);
    if (!tenantId) return;
    await (supabase as unknown as {
      from: (t: string) => {
        upsert: (v: Record<string, unknown>, o: { onConflict: string }) => Promise<unknown>;
      };
    }).from("tenant_branding").upsert(
      {
        tenant_id: tenantId,
        logo_url: next.logo_url,
        primary_color: next.primary_color,
        accent_color: next.accent_color,
        theme_mode: next.theme_mode,
        workspace_name: next.workspace_name,
      },
      { onConflict: "tenant_id" },
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        tenantId,
        tenantName,
        fullName,
        branding,
        access: accessMap,
        setMode,
        saveBranding,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace deve estar dentro de <WorkspaceProvider>");
  return ctx;
}
