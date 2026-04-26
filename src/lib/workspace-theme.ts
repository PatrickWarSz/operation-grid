// Tema isolado do workspace (portal pós-login).
// Independente da landing page — fundo branco/escuro neutro, cores dirigidas pelo tenant.

export type ThemeMode = "light" | "dark";

export interface TenantBranding {
  logo_url: string | null;
  primary_color: string; // hex ex: #0EA5E9
  accent_color: string;  // hex
  theme_mode: ThemeMode;
  workspace_name: string | null;
}

export const DEFAULT_BRANDING: TenantBranding = {
  logo_url: null,
  primary_color: "#0EA5E9",
  accent_color: "#6366F1",
  theme_mode: "light",
  workspace_name: null,
};

/** Converte hex em "r g b" para usar com CSS rgb(var(--ws-primary) / <alpha>) */
function hexToRgbTriplet(hex: string): string {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Aplica branding no escopo do workspace (.workspace-root). NÃO toca na landing. */
export function applyWorkspaceBranding(branding: TenantBranding) {
  if (typeof document === "undefined") return;
  const root = document.querySelector<HTMLElement>(".workspace-root");
  if (!root) return;
  root.style.setProperty("--ws-primary", hexToRgbTriplet(branding.primary_color));
  root.style.setProperty("--ws-accent", hexToRgbTriplet(branding.accent_color));
  root.dataset.theme = branding.theme_mode;
}

export function getStoredThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem("ws-theme-mode");
  return v === "light" || v === "dark" ? v : null;
}

export function setStoredThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("ws-theme-mode", mode);
}

export function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function firstName(input: string | null | undefined): string {
  if (!input) return "";
  const beforeAt = input.includes("@") ? input.split("@")[0] : input;
  const first = beforeAt.split(/[\s._-]+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
