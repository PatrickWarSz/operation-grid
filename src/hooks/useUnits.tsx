import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * MOCK UNITS — sem backend.
 * Lista de filiais fictícias guardadas em localStorage.
 */

const ACTIVE_UNIT_KEY = "hub:active_unit";
const UNITS_KEY = "mock:units";

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
  maxUnits: number;
  canCreateUnit: boolean;
  refresh: () => Promise<void>;
  createUnit: (name: string) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
}

const UnitsContext = createContext<UnitsContextValue | undefined>(undefined);

const DEFAULT_UNITS: UnitRow[] = [
  {
    id: "unit-matriz",
    tenant_id: "tenant-mock-1",
    name: "Matriz",
    slug: "matriz",
    is_primary: true,
    address: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "unit-filial-sp",
    tenant_id: "tenant-mock-1",
    name: "Filial São Paulo",
    slug: "filial-sao-paulo",
    is_primary: false,
    address: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function readUnits(): UnitRow[] {
  if (typeof window === "undefined") return DEFAULT_UNITS;
  try {
    const raw = window.localStorage.getItem(UNITS_KEY);
    return raw ? (JSON.parse(raw) as UnitRow[]) : DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
}

function writeUnits(list: UnitRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNITS_KEY, JSON.stringify(list));
}

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

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_UNIT_KEY);
  });
  const maxUnits = 5; // mock: limite fictício

  const load = useCallback(async () => {
    setLoading(true);
    setUnits(readUnits());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading || units.length === 0) return;
    const valid = activeUnitId && units.find((u) => u.id === activeUnitId);
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

  const canCreateUnit = units.length < maxUnits;

  const createUnit = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newUnit: UnitRow = {
      id: `unit-${Date.now()}`,
      tenant_id: "tenant-mock-1",
      name: trimmed,
      slug: slugify(trimmed),
      is_primary: false,
      address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const next = [...units, newUnit];
    setUnits(next);
    writeUnits(next);
  };

  const deleteUnit = async (id: string) => {
    const next = units.filter((u) => u.id !== id);
    setUnits(next);
    writeUnits(next);
  };

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
        createUnit,
        deleteUnit,
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
