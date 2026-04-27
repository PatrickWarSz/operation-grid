import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

export type ModuleStatus = "active" | "trial" | "blocked";

export interface ModuleAccessRow {
  module_id: string;
  status: ModuleStatus;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  effective_status: ModuleStatus;
  trial_days_left: number | null;
}

export interface ProfileMeta {
  segment: string | null;
  company_size: string | null;
  main_pain: string | null;
  onboarded_at: string | null;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body_md: string;
  category: "feature" | "fix" | "beta" | "exclusive" | "announcement";
  module_id: string | null;
  media_url: string | null;
  media_type: string | null;
  target_tenant_id: string | null;
  published_at: string;
}

interface WorkspaceContextValue {
  loading: boolean;
  tenantId: string | null;
  tenantName: string;
  fullName: string | null;
  profileMeta: ProfileMeta;
  branding: TenantBranding;
  isAdmin: boolean;
  access: Map<string, ModuleStatus>;
  accessRows: ModuleAccessRow[];
  announcements: AnnouncementRow[];
  unreadIds: Set<string>;
  setMode: (mode: ThemeMode) => void;
  saveBranding: (patch: Partial<TenantBranding>) => Promise<void>;
  saveProfile: (patch: Partial<ProfileMeta> & { full_name?: string }) => Promise<void>;
  startTrial: (moduleId: string) => Promise<void>;
  markAnnouncementRead: (announcementId: string) => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// helper para escapar tipagem do Supabase quando a tabela é "opcional" (criada por SQL externo)
type AnyClient = {
  from: (t: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const sb = supabase as unknown as AnyClient;

  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("");
  const [fullName, setFullName] = useState<string | null>(null);
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>({
    segment: null, company_size: null, main_pain: null, onboarded_at: null,
  });
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [accessRows, setAccessRows] = useState<ModuleAccessRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());

  const loadAccess = useCallback(async (tId: string) => {
    const { data } = await sb.from("v_module_access_effective").select("*").eq("tenant_id", tId);
    setAccessRows((data as ModuleAccessRow[]) ?? []);
  }, [sb]);

  const loadAnnouncements = useCallback(async () => {
    if (!user) return;
    const { data: rows } = await sb
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(50);
    const list = (rows as AnnouncementRow[]) ?? [];
    setAnnouncements(list);

    if (list.length > 0) {
      const { data: reads } = await sb
        .from("announcement_reads")
        .select("announcement_id")
        .eq("user_id", user.id);
      const readSet = new Set((reads ?? []).map((r: { announcement_id: string }) => r.announcement_id));
      setUnreadIds(new Set(list.filter((a) => !readSet.has(a.id)).map((a) => a.id)));
    } else {
      setUnreadIds(new Set());
    }
  }, [sb, user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // 1) profile + tenant + meta de onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, full_name, segment, company_size, main_pain, onboarded_at, tenants(name)")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const p = profile as unknown as {
        tenant_id: string | null;
        full_name: string | null;
        segment: string | null;
        company_size: string | null;
        main_pain: string | null;
        onboarded_at: string | null;
        tenants: { name: string } | null;
      } | null;

      const tName = p?.tenants?.name ?? "";
      const tId = p?.tenant_id ?? null;
      setTenantName(tName);
      setTenantId(tId);
      setFullName(p?.full_name ?? null);
      setProfileMeta({
        segment: p?.segment ?? null,
        company_size: p?.company_size ?? null,
        main_pain: p?.main_pain ?? null,
        onboarded_at: p?.onboarded_at ?? null,
      });

      // 2) branding
      let initialBranding: TenantBranding = { ...DEFAULT_BRANDING };
      if (tId) {
        const { data: brand } = await sb
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
      const stored = getStoredThemeMode();
      if (stored) initialBranding.theme_mode = stored;
      setBranding(initialBranding);

      // 3) access (via view efetiva)
      if (tId) await loadAccess(tId);

      // 4) admin role
      const { data: roleRow } = await sb
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleRow);

      // 5) announcements
      await loadAnnouncements();

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user, sb, loadAccess, loadAnnouncements]);

  useEffect(() => { applyWorkspaceBranding(branding); }, [branding]);

  const accessMap = useMemo(
    () => new Map(accessRows.map((a) => [a.module_id, a.effective_status])),
    [accessRows],
  );

  const setMode = (mode: ThemeMode) => {
    setStoredThemeMode(mode);
    setBranding((b) => ({ ...b, theme_mode: mode }));
  };

  const saveBranding = async (patch: Partial<TenantBranding>) => {
    const next = { ...branding, ...patch };
    setBranding(next);
    if (!tenantId) return;
    await sb.from("tenant_branding").upsert(
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

  const saveProfile = async (patch: Partial<ProfileMeta> & { full_name?: string }) => {
    if (!user) return;
    const update: Record<string, unknown> = {};
    if (patch.segment !== undefined) update.segment = patch.segment;
    if (patch.company_size !== undefined) update.company_size = patch.company_size;
    if (patch.main_pain !== undefined) update.main_pain = patch.main_pain;
    if (patch.onboarded_at !== undefined) update.onboarded_at = patch.onboarded_at;
    if (patch.full_name !== undefined) update.full_name = patch.full_name;

    await supabase.from("profiles").update(update).eq("id", user.id);
    setProfileMeta((m) => ({
      segment: patch.segment ?? m.segment,
      company_size: patch.company_size ?? m.company_size,
      main_pain: patch.main_pain ?? m.main_pain,
      onboarded_at: patch.onboarded_at ?? m.onboarded_at,
    }));
    if (patch.full_name !== undefined) setFullName(patch.full_name);
  };

  const startTrial = async (moduleId: string) => {
    const { error } = await sb.rpc("start_module_trial", { _module_id: moduleId });
    if (error) throw error;
    if (tenantId) await loadAccess(tenantId);
  };

  const markAnnouncementRead = async (announcementId: string) => {
    if (!user) return;
    setUnreadIds((s) => {
      const n = new Set(s);
      n.delete(announcementId);
      return n;
    });
    await sb.from("announcement_reads").upsert(
      { user_id: user.id, announcement_id: announcementId },
      { onConflict: "user_id,announcement_id" },
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        tenantId,
        tenantName,
        fullName,
        profileMeta,
        branding,
        isAdmin,
        access: accessMap,
        accessRows,
        announcements,
        unreadIds,
        setMode,
        saveBranding,
        saveProfile,
        startTrial,
        markAnnouncementRead,
        refreshAnnouncements: loadAnnouncements,
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
