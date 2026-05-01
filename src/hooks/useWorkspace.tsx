import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { MODULES } from "@/lib/modules";
import {
  DEFAULT_BRANDING,
  applyWorkspaceBranding,
  getStoredThemeMode,
  setStoredThemeMode,
  type TenantBranding,
  type ThemeMode,
} from "@/lib/workspace-theme";

/**
 * MOCK WORKSPACE — sem backend.
 * Estado local com dados fictícios. Branding e profile persistem em
 * localStorage para sobreviver a refresh.
 */

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

const PROFILE_KEY = "mock:profile";
const BRANDING_KEY = "mock:branding";
const ACCESS_KEY = "mock:access";
const READ_KEY = "mock:announcement_reads";

const MOCK_TENANT_ID = "tenant-mock-1";
const MOCK_TENANT_NAME = "Acme Ltda";

const MOCK_ANNOUNCEMENTS: AnnouncementRow[] = [
  {
    id: "ann-1",
    title: "Novo: Módulo de Devoluções em beta",
    body_md: "Já está disponível para todos os clientes a primeira versão do programa Devoluções Pro. Teste por 7 dias.",
    category: "beta",
    module_id: null,
    media_url: null,
    media_type: null,
    target_tenant_id: null,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "ann-2",
    title: "Atualização do Estoque Pro",
    body_md: "Agora com suporte a múltiplas filiais e relatórios consolidados.",
    category: "feature",
    module_id: "estoque",
    media_url: null,
    media_type: null,
    target_tenant_id: null,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "ann-3",
    title: "Correção: cálculo de custo médio",
    body_md: "Ajustamos o cálculo de custo médio quando há transferências entre filiais.",
    category: "fix",
    module_id: null,
    media_url: null,
    media_type: null,
    target_tenant_id: null,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

function buildDefaultAccess(): ModuleAccessRow[] {
  // Por padrão, libera o primeiro módulo como ativo, segundo em trial e o resto bloqueado.
  return MODULES.map((m, idx) => {
    const status: ModuleStatus = idx === 0 ? "active" : idx === 1 ? "trial" : "blocked";
    const trialStart = status === "trial" ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() : null;
    const trialEnd = status === "trial" ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() : null;
    return {
      module_id: m.id,
      status,
      trial_started_at: trialStart,
      trial_ends_at: trialEnd,
      effective_status: status,
      trial_days_left: status === "trial" ? 5 : null,
    };
  });
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>({
    segment: null,
    company_size: null,
    main_pain: null,
    onboarded_at: null,
  });
  const [fullName, setFullName] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [accessRows, setAccessRows] = useState<ModuleAccessRow[]>([]);
  const [announcements] = useState<AnnouncementRow[]>(MOCK_ANNOUNCEMENTS);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Bootstrap mock data
  useEffect(() => {
    if (!user) return;

    const storedProfile = readJSON<{ profile: ProfileMeta; full_name: string | null }>(PROFILE_KEY, {
      profile: { segment: null, company_size: null, main_pain: null, onboarded_at: null },
      full_name: null,
    });
    setProfileMeta(storedProfile.profile);
    setFullName(storedProfile.full_name);

    const storedBranding = readJSON<TenantBranding>(BRANDING_KEY, { ...DEFAULT_BRANDING });
    const stored = getStoredThemeMode();
    if (stored) storedBranding.theme_mode = stored;
    setBranding(storedBranding);

    const storedAccess = readJSON<ModuleAccessRow[] | null>(ACCESS_KEY, null);
    setAccessRows(storedAccess ?? buildDefaultAccess());

    const storedReads = readJSON<string[]>(READ_KEY, []);
    setReadIds(new Set(storedReads));

    setLoading(false);
  }, [user]);

  useEffect(() => {
    applyWorkspaceBranding(branding);
  }, [branding]);

  const accessMap = useMemo(
    () => new Map(accessRows.map((a) => [a.module_id, a.effective_status])),
    [accessRows],
  );

  const unreadIds = useMemo(() => {
    return new Set(announcements.filter((a) => !readIds.has(a.id)).map((a) => a.id));
  }, [announcements, readIds]);

  const setMode = (mode: ThemeMode) => {
    setStoredThemeMode(mode);
    setBranding((b) => {
      const next = { ...b, theme_mode: mode };
      writeJSON(BRANDING_KEY, next);
      return next;
    });
  };

  const saveBranding = async (patch: Partial<TenantBranding>) => {
    setBranding((b) => {
      const next = { ...b, ...patch };
      writeJSON(BRANDING_KEY, next);
      return next;
    });
  };

  const saveProfile = async (patch: Partial<ProfileMeta> & { full_name?: string }) => {
    setProfileMeta((m) => {
      const next: ProfileMeta = {
        segment: patch.segment !== undefined ? patch.segment : m.segment,
        company_size: patch.company_size !== undefined ? patch.company_size : m.company_size,
        main_pain: patch.main_pain !== undefined ? patch.main_pain : m.main_pain,
        onboarded_at: patch.onboarded_at !== undefined ? patch.onboarded_at : m.onboarded_at,
      };
      const newFullName = patch.full_name !== undefined ? patch.full_name : fullName;
      writeJSON(PROFILE_KEY, { profile: next, full_name: newFullName });
      return next;
    });
    if (patch.full_name !== undefined) setFullName(patch.full_name);
  };

  const startTrial = async (moduleId: string) => {
    setAccessRows((rows) => {
      const next = rows.map((r) =>
        r.module_id === moduleId
          ? {
              ...r,
              status: "trial" as ModuleStatus,
              effective_status: "trial" as ModuleStatus,
              trial_started_at: new Date().toISOString(),
              trial_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
              trial_days_left: 7,
            }
          : r,
      );
      writeJSON(ACCESS_KEY, next);
      return next;
    });
  };

  const markAnnouncementRead = async (id: string) => {
    setReadIds((s) => {
      const n = new Set(s);
      n.add(id);
      writeJSON(READ_KEY, Array.from(n));
      return n;
    });
  };

  const refreshAnnouncements = async () => {
    /* noop em mock */
  };

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        tenantId: MOCK_TENANT_ID,
        tenantName: MOCK_TENANT_NAME,
        fullName,
        profileMeta,
        branding,
        isAdmin: true, // Mock: usuário sempre é admin para ver o painel.
        access: accessMap,
        accessRows,
        announcements,
        unreadIds,
        setMode,
        saveBranding,
        saveProfile,
        startTrial,
        markAnnouncementRead,
        refreshAnnouncements,
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
