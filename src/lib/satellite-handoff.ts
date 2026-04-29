/**
 * Handoff de sessão Hub → app satélite.
 *
 * Como ambos compartilham o mesmo projeto Supabase (mesma URL + anon key),
 * o JWT do Hub vale no satélite. O que falta é entregar o token, já que
 * localStorage não cruza origins distintos.
 *
 * Estratégia: anexar fragment `#access_token=...&refresh_token=...` à URL do
 * satélite. Esse é o mesmo formato emitido pelo OAuth do Supabase, então o
 * `supabase-js` no satélite (com `detectSessionInUrl: true`, que é o default)
 * persiste a sessão automaticamente sem código novo.
 *
 * Fragment vai no `#` — não trafega pra servidor nem aparece em logs.
 */

import type { Session } from "@supabase/supabase-js";

/**
 * Lista de hosts confiáveis. Qualquer redirect externo precisa estar aqui —
 * caso contrário é open redirect.
 *
 * Adicione novos satélites aqui conforme forem publicados.
 */
export const SATELLITE_ALLOWED_HOSTS: readonly string[] = [
  "estoquemat.lovable.app",
  // Futuros satélites:
  // "devolucoes.hubnexus.com",
];

/** Verifica se uma URL aponta pra um satélite confiável. */
export function isAllowedSatelliteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return SATELLITE_ALLOWED_HOSTS.includes(u.host);
  } catch {
    return false;
  }
}

export interface BuildSatelliteUrlOpts {
  /** ID da filial ativa no Hub. Vai no fragment como `unit_id=...`. */
  unitId?: string | null;
}

/**
 * Monta a URL final pro satélite com handoff de sessão no fragment.
 * Se a sessão for null, devolve a URL sem token (satélite vai mandar voltar
 * pro Hub login).
 *
 * Quando `opts.unitId` é passado, o fragment ganha `&unit_id=<uuid>` para o
 * satélite saber qual filial está ativa (ele lê e persiste em
 * localStorage["hub:active_unit"]).
 */
export function buildSatelliteUrl(
  externalUrl: string,
  session: Session | null,
  opts: BuildSatelliteUrlOpts = {},
): string {
  if (!isAllowedSatelliteUrl(externalUrl)) {
    // Defensivo: nunca expor tokens pra host não-whitelisted.
    return externalUrl;
  }
  if (!session) return externalUrl;

  const params: Record<string, string> = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: String(session.expires_in ?? 3600),
    token_type: session.token_type ?? "bearer",
    type: "recovery",
  };
  if (opts.unitId) params.unit_id = opts.unitId;

  const fragment = new URLSearchParams(params).toString();

  // Preserva qualquer fragment já existente seria raro aqui; sobrescrevemos.
  const [base] = externalUrl.split("#");
  return `${base}#${fragment}`;
}
