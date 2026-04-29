import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

/**
 * Multi-unidade (Filiais).
 *
 * - Tenant = empresa, Unit = filial (1:N).
 * - Acesso via tabela user_units (RLS já garante que o user só vê suas units).
 * - Unit ativa persiste em localStorage["hub:active_unit"].
 * - max_units vem da função public.tenant_max_units(_tenant) (definida no SQL do plano).
 */

const ACTIVE_UNIT_KEY = "hub:active_unit";

export interface UnitRow {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  is_primary: boolean;
  address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface UnitsContextValue {
  loading: boolean;
  units: UnitRow[];
  activeUnit: UnitRow | null;
  activeUnitId: string | null;
  setActiveUnit: (unitId: string) => void;
  maxUnits: number; // Infinity = ilimitado
  canCreateUnit: boolean;
  refresh: () => Promise<void>;
}

const UnitsContext = createContext<UnitsContextValue | undefined>(undefined);

type AnyClient = {
  from: (t: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

export function UnitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { tenantId, isAdmin } = useWorkspace();
  const sb = supabase as unknown as AnyClient;

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_UNIT_KEY);
  });
  const [maxUnits, setMaxUnits] = useState<number>(1);

  const load = useCallback(async () => {
    if (!user || !tenantId) {
      setUnits([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // RLS já filtra: user só vê units onde tem user_units.
    const { data: unitsData } = await sb
      .from("units")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("is_primary", { ascending: false })
      .order("name", { ascending: true });

    const list = (unitsData as UnitRow[]) ?? [];
    setUnits(list);

    // max_units do plano
    const { data: maxData } = await sb.rpc("tenant_max_units", { _tenant: tenantId });
    const max = typeof maxData === "number" ? maxData : 1;
    setMaxUnits(max <= 0 ? Infinity : max);

    setLoading(false);
  }, [sb, user, tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Garante que activeUnitId seja válido. Fallback: primary, depois primeira.
  useEffect(() => {
    if (loading || units.length === 0) return;
    const stored = activeUnitId;
    const valid = stored && units.find((u) => u.id === stored);
    if (valid) return;
    const fallback = units.find((u) => u.is_primary) ?? units[0];
    if (fallback) {
      setActiveUnitIdState(fallback.id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_UNIT_KEY, fallback.id);
      }
    }
  }, [loading, units, activeUnitId]);

  const setActiveUnit = useCallback((unitId: string) => {
    setActiveUnitIdState(unitId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_UNIT_KEY, unitId);
    }
  }, []);

  const activeUnit = useMemo(
    () => units.find((u) => u.id === activeUnitId) ?? null,
    [units, activeUnitId],
  );

  const canCreateUnit = isAdmin && units.length < maxUnits;

  return (
    <UnitsContext.Provider
      value={{
        loading,
        units,
        activeUnit,
        activeUnitId,
        setActiveUnit,
        maxUnits,
        canCreateUnit,
        refresh: load,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits deve estar dentro de <UnitsProvider>");
  return ctx;
}
