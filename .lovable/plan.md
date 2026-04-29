
# Multi-unidade (Filiais) no Hub Nexus

Adiciona suporte a múltiplas filiais por tenant. O empreendedor compra **um** plano e gerencia N filiais sem pagar de novo, dentro do limite do plano.

## Decisões aprovadas

1. **Modelo:** `Tenant = empresa`, `Unit = filial` (1:N). Billing/módulos continuam no tenant.
2. **Permissão:** acesso explícito via `user_units` (cada user só vê units onde foi adicionado).
3. **Billing:** plano define `max_units` (Starter=1, Growth=3, Enterprise=∞).
4. **Satélites:** unit ativa enviada no fragment do handoff (`#unit_id=...`) e persistida no satélite.

---

## 1. Schema (migração SQL)

```text
units
├── id uuid pk
├── tenant_id uuid → tenants(id) on delete cascade
├── name text                 -- "Matriz", "Filial SP"
├── slug text                 -- "matriz", "sp" (único por tenant)
├── is_primary bool           -- a "home" do tenant, criada no signup
├── address jsonb
├── created_at, updated_at

user_units
├── user_id uuid → auth.users(id) on delete cascade
├── unit_id uuid → units(id) on delete cascade
├── role text default 'member'  -- 'admin' | 'member' (escopo da unit)
├── pk (user_id, unit_id)
```

**Backfill:** todo tenant existente ganha 1 unit `is_primary=true` chamada "Matriz". Todo profile do tenant é vinculado a essa unit em `user_units`.

**RLS (security definer):**
- `public.user_has_unit_access(_user uuid, _unit uuid) returns bool` — checa `user_units` sem recursão.
- `public.user_units_for_tenant(_user uuid, _tenant uuid) returns setof uuid` — lista units visíveis.
- Policies em `units`: SELECT se `user_has_unit_access(auth.uid(), id)`.
- Policies em `user_units`: SELECT do próprio user; INSERT/DELETE só por admin do tenant.

**Plano:** adicionar `max_units int` em `plans` (ou colocar em `tenant_module_access` se for por módulo). Função `public.tenant_units_remaining(_tenant uuid) returns int`.

---

## 2. Hub — UI e estado

**`useWorkspace`** (`src/hooks/useWorkspace.tsx`)
- Carrega `units` do tenant + `user_units` do user logado.
- Expõe: `units`, `activeUnitId`, `setActiveUnit(id)`, `maxUnits`, `canCreateUnit`.
- Persistência da unit ativa: `localStorage["hub:active_unit"]` + validação contra units acessíveis. Fallback = primária.

**Switcher (header)** — `src/components/workspace/UnitSwitcher.tsx`
- Dropdown estilo Slack no header de `_authenticated.tsx`, à esquerda do sino.
- Lista units visíveis com check na ativa.
- Item "Gerenciar filiais" → `/app/configuracoes/filiais`.
- Item "+ Nova filial" se `canCreateUnit` (admin + dentro do `max_units`).

**Página de gerenciamento** — `src/routes/_authenticated/app.configuracoes.filiais.tsx`
- Lista units (nome, slug, primária, # de membros).
- Criar/editar/desativar (não excluir primária).
- Tabela de membros por unit: adicionar email existente do tenant, definir role, remover.
- Mostra contador `usadas / max_units` + CTA upgrade se atingir limite.

**Onboarding** — ao criar tenant no signup, criar unit "Matriz" automática + vínculo do owner.

---

## 3. Handoff Hub → Satélite

**`src/lib/satellite-handoff.ts`** — adicionar `unit_id?: string` em `buildSatelliteUrl(externalUrl, session, opts?)`:
- Se passado, anexa `&unit_id=<uuid>` ao fragment.
- Hub sempre envia a unit ativa atual.

**`ActiveProgramCard` / abertura de satélite** (`app.tsx`, `app.programas.$slug.tsx`)
- Lê `activeUnitId` do `useWorkspace` e passa pro `buildSatelliteUrl`.

---

## 4. Satélite — protocolo (atualiza template)

Atualizar `.lovable/satellite-template.md`:
- Toda tabela de negócio passa a ter **`unit_id uuid not null references units(id)`** além de `tenant_id`.
- RLS dupla: filtrar por tenant **e** por `user_has_unit_access(auth.uid(), unit_id)`.
- `src/lib/hub.ts` ganha:
  - leitura de `unit_id` do fragment no handoff → salva em `localStorage["hub:active_unit"]`.
  - `getActiveUnit()` / `setActiveUnit(id)`.
- Header do satélite mostra a unit ativa (read-only) com link "Trocar filial no Hub →" abrindo `hubnexusgrid.lovable.app/app` em nova guia. Sem switcher próprio (decisão: handoff é a fonte da verdade).
- Toda query: `.eq('tenant_id', tenant).eq('unit_id', unit)`.

---

## 5. Memory

Atualizar `mem://index.md` (Core) com a regra: "Tenant = empresa; Unit = filial. Toda tabela de negócio tem `tenant_id` E `unit_id`. Acesso por `user_units`. `max_units` vem do plano."

Criar `mem://features/multi-unit.md` com o contrato completo (schema, RLS, handoff, billing).

---

## 6. Fora de escopo (fica pra depois)

- Cobrança de filial extra como add-on (escolhido `max_units` por plano).
- Relatórios cross-unit consolidados (cada satélite resolve quando precisar).
- Permissão granular por módulo dentro da unit.
- Migração de dados entre filiais.

---

## Arquivos

**Novos**
- migration SQL (`units`, `user_units`, funções, RLS, `max_units`, backfill)
- `src/components/workspace/UnitSwitcher.tsx`
- `src/routes/_authenticated/app.configuracoes.filiais.tsx`
- `mem://features/multi-unit.md`

**Editados**
- `src/hooks/useWorkspace.tsx` (units + activeUnit)
- `src/routes/_authenticated.tsx` (switcher no header)
- `src/lib/satellite-handoff.ts` (unit_id no fragment)
- `src/routes/_authenticated/app.tsx`, `app.programas.$slug.tsx` (passar unit ativa)
- `src/lib/modules.ts` / `PLANS` (adicionar `maxUnits` em cada plano)
- `src/routes/signup.tsx` (criar unit primária no onboarding)
- `.lovable/satellite-template.md` (regras de unit_id)
- `mem://index.md`

Quando você aprovar, eu entro em build mode, rodo a migração, faço os componentes e o switcher aparece no topo igual Slack.
