
# Multi-unidade (Filiais) — sem Lovable Cloud

Divisão clara: **você** roda 1 bloco de SQL no Supabase (SQL Editor). **Eu** faço todo o resto no código (hooks, switcher, página de filiais, handoff e template do satélite).

---

## Parte 1 — SQL que VOCÊ roda no Supabase

Abra **Supabase → SQL Editor → New query**, cole o bloco abaixo e clique em **Run**. É idempotente (pode rodar de novo sem quebrar).

```sql
-- =========================================================
-- MULTI-UNIDADE (Filiais) — Hub Nexus
-- =========================================================

-- 1) Tabela units
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  is_primary boolean not null default false,
  address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists units_tenant_idx on public.units(tenant_id);

-- só uma primária por tenant
create unique index if not exists units_one_primary_per_tenant
  on public.units(tenant_id) where is_primary;

-- 2) Tabela user_units (acesso explícito)
create table if not exists public.user_units (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  role text not null default 'member', -- 'admin' | 'member'
  created_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);
create index if not exists user_units_unit_idx on public.user_units(unit_id);

-- 3) Funções security definer (sem recursão de RLS)
create or replace function public.user_has_unit_access(_user uuid, _unit uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_units
    where user_id = _user and unit_id = _unit
  );
$$;

create or replace function public.user_tenant_id(_user uuid)
returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = _user;
$$;

create or replace function public.tenant_max_units(_tenant uuid)
returns int
language sql stable security definer set search_path = public as $$
  -- Lê do maior plano ativo do tenant. Ajuste se sua tabela de plano tiver outro nome.
  -- Default 1 se não encontrar nada.
  select coalesce(max(max_units), 1)
  from public.tenant_module_access tma
  where tma.tenant_id = _tenant;
$$;

-- 4) Coluna max_units no controle de plano/módulo
alter table public.tenant_module_access
  add column if not exists max_units int not null default 1;

-- 5) RLS
alter table public.units enable row level security;
alter table public.user_units enable row level security;

drop policy if exists "units_select_member" on public.units;
create policy "units_select_member" on public.units
  for select to authenticated
  using (public.user_has_unit_access(auth.uid(), id));

drop policy if exists "units_insert_admin" on public.units;
create policy "units_insert_admin" on public.units
  for insert to authenticated
  with check (
    tenant_id = public.user_tenant_id(auth.uid())
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "units_update_admin" on public.units;
create policy "units_update_admin" on public.units
  for update to authenticated
  using (
    tenant_id = public.user_tenant_id(auth.uid())
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "units_delete_admin" on public.units;
create policy "units_delete_admin" on public.units
  for delete to authenticated
  using (
    tenant_id = public.user_tenant_id(auth.uid())
    and public.has_role(auth.uid(), 'admin')
    and is_primary = false
  );

drop policy if exists "user_units_select_self" on public.user_units;
create policy "user_units_select_self" on public.user_units
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.units u
      where u.id = unit_id
        and u.tenant_id = public.user_tenant_id(auth.uid())
        and public.has_role(auth.uid(), 'admin')
    )
  );

drop policy if exists "user_units_admin_write" on public.user_units;
create policy "user_units_admin_write" on public.user_units
  for all to authenticated
  using (
    exists (
      select 1 from public.units u
      where u.id = unit_id
        and u.tenant_id = public.user_tenant_id(auth.uid())
        and public.has_role(auth.uid(), 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.units u
      where u.id = unit_id
        and u.tenant_id = public.user_tenant_id(auth.uid())
        and public.has_role(auth.uid(), 'admin')
    )
  );

-- 6) Backfill: cria "Matriz" pra todo tenant existente
insert into public.units (tenant_id, name, slug, is_primary)
select t.id, 'Matriz', 'matriz', true
from public.tenants t
where not exists (
  select 1 from public.units u where u.tenant_id = t.id and u.is_primary
);

-- vincula todos os profiles à matriz do tenant
insert into public.user_units (user_id, unit_id, role)
select p.id, u.id, 'member'
from public.profiles p
join public.units u on u.tenant_id = p.tenant_id and u.is_primary
on conflict do nothing;

-- 7) Trigger: novo tenant → cria Matriz; novo profile → vincula à Matriz
create or replace function public.create_primary_unit_for_tenant()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.units (tenant_id, name, slug, is_primary)
  values (new.id, 'Matriz', 'matriz', true)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_tenant_primary_unit on public.tenants;
create trigger trg_tenant_primary_unit
  after insert on public.tenants
  for each row execute function public.create_primary_unit_for_tenant();

create or replace function public.link_profile_to_primary_unit()
returns trigger language plpgsql security definer set search_path = public as $$
declare _unit uuid;
begin
  select id into _unit from public.units
   where tenant_id = new.tenant_id and is_primary limit 1;
  if _unit is not null then
    insert into public.user_units (user_id, unit_id, role)
    values (new.id, _unit, 'member')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profile_link_unit on public.profiles;
create trigger trg_profile_link_unit
  after insert on public.profiles
  for each row execute function public.link_profile_to_primary_unit();
```

**Pontos a confirmar antes de rodar:**
- Sua tabela de plano por tenant se chama mesmo `tenant_module_access`? Se tiver uma `plans` separada, me avise — ajusto o `tenant_max_units()`.
- A função `has_role(uuid, app_role)` já existe (foi criada no setup de roles). Se não, me avise.

Quando rodar, me responde só **"rodei"** que eu sigo pra Parte 2.

---

## Parte 2 — Código que EU faço (Hub)

Sem tocar em DB, só consumindo o que o SQL acima criou.

**Arquivos novos**
- `src/hooks/useUnits.tsx` — carrega `units` visíveis + `user_units`, gerencia `activeUnitId` em `localStorage["hub:active_unit"]`, expõe `setActiveUnit`, `maxUnits`, `canCreateUnit`.
- `src/components/workspace/UnitSwitcher.tsx` — dropdown estilo Slack no header, à esquerda do `NotificationBell`. Lista units, marca a ativa, item "Gerenciar filiais", item "+ Nova filial" (se admin e dentro do limite).
- `src/routes/_authenticated/app.configuracoes.filiais.tsx` — página de gestão: lista, criar/editar, membros por unit, contador `usadas / max_units` + CTA de upgrade.

**Arquivos editados**
- `src/routes/_authenticated.tsx` — encaixa o `<UnitSwitcher />` no header.
- `src/lib/satellite-handoff.ts` — `buildSatelliteUrl(url, session, { unitId? })` anexa `&unit_id=<uuid>` no fragment.
- `src/routes/_authenticated/app.tsx` e `app.programas.$slug.tsx` — passam `activeUnitId` ao abrir satélite.
- `src/lib/modules.ts` — adiciona `maxUnits` em cada plano (Starter=1, Growth=3, Enterprise=∞ representado por `null`/`Infinity`). Só visual no Hub; o limite real é o do banco.

**Memória**
- `mem://features/multi-unit.md` com o contrato completo.
- Atualizar Core do `mem://index.md` com a regra "Tenant=empresa, Unit=filial; toda tabela de negócio tem `tenant_id` E `unit_id`; acesso por `user_units`".

---

## Parte 3 — Template do satélite (atualizo o `.lovable/satellite-template.md`)

Adiciono ao template, pra que próximos satélites já nasçam multi-unit:

1. SQL do satélite: toda tabela de negócio com `unit_id uuid not null references units(id)` + RLS dupla (`tenant_id` E `user_has_unit_access(auth.uid(), unit_id)`).
2. `src/lib/hub.ts` do satélite lê `unit_id` do fragment no handoff e salva em `localStorage["hub:active_unit"]`.
3. Header do satélite mostra a unit ativa (read-only) com link "Trocar filial no Hub →".
4. Toda query do satélite: `.eq('tenant_id', tenant).eq('unit_id', unit)`.

---

## Fluxo

```text
1. Você cola o SQL da Parte 1 no Supabase e roda.
2. Me responde "rodei".
3. Eu executo Parte 2 + Parte 3 (puro código TS/React).
4. Switcher aparece no header, página /app/configuracoes/filiais funciona,
   handoff já leva unit_id pros satélites.
```

Aprova esse plano? Se sim, eu já te entrego o SQL pra você rodar e fico aguardando seu "rodei" pra seguir com o código.
