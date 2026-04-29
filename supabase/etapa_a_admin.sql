-- =====================================================================
-- HUB NEXUS — Etapa A — Painel Admin (sem Asaas ainda)
-- Rode este SQL inteiro UMA VEZ no SQL Editor do Supabase.
-- Idempotente: pode rodar mais de uma vez sem quebrar.
-- =====================================================================

-- 1) Tabela de PLANOS ----------------------------------------------------
create table if not exists public.plans (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  price_monthly numeric(10,2) not null default 0,
  max_units    int not null default 1,
  module_slugs text[] not null default '{}',
  description  text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- planos iniciais (idempotente)
insert into public.plans (slug, name, price_monthly, max_units, module_slugs, description)
values
  ('starter',  'Starter',  99.00,  1, '{devolucoes}',                 'Perfeito pra começar — 1 módulo, 1 filial.'),
  ('growth',   'Growth',  249.00,  3, '{devolucoes,estoque,financeiro}', 'Cresce com você — múltiplos módulos e filiais.'),
  ('pro',      'Pro',     499.00, 10, '{devolucoes,estoque,financeiro,vendas,relatorios}', 'Operação completa — todos os módulos liberados.')
on conflict (slug) do nothing;


-- 2) Catálogo de MÓDULOS (espelha src/lib/modules.ts) -------------------
create table if not exists public.modules_catalog (
  slug         text primary key,
  name         text not null,
  short        text,
  description  text,
  price_monthly numeric(10,2) default 0,
  status       text not null default 'available',  -- available | coming_soon
  external_url text,
  landing_url  text,
  display_order int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- 3) Alterações em TENANTS ----------------------------------------------
alter table public.tenants
  add column if not exists plan_id              uuid references public.plans(id),
  add column if not exists subscription_status  text not null default 'trial',
  add column if not exists trial_ends_at        timestamptz,
  add column if not exists current_period_end   timestamptz,
  -- campos pro Asaas (preenchidos na Etapa B)
  add column if not exists asaas_customer_id    text,
  add column if not exists asaas_subscription_id text;

-- subscription_status válido: trial | active | overdue | cancelled


-- 4) Histórico de PAGAMENTOS -------------------------------------------
create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  asaas_payment_id  text unique,
  amount            numeric(10,2) not null,
  status            text not null,                  -- PENDING | CONFIRMED | OVERDUE | REFUNDED | CANCELLED
  billing_type      text,                            -- PIX | BOLETO | CREDIT_CARD
  due_date          date,
  paid_at           timestamptz,
  invoice_url       text,
  description       text,
  created_at        timestamptz not null default now()
);
create index if not exists payments_tenant_idx on public.payments(tenant_id);
create index if not exists payments_status_idx on public.payments(status);


-- 5) Auditoria de ações admin ------------------------------------------
create table if not exists public.admin_audit (
  id              uuid primary key default gen_random_uuid(),
  admin_user_id   uuid references auth.users(id) on delete set null,
  action          text not null,                    -- module_activated | plan_changed | trial_granted | tenant_cancelled...
  target_tenant_id uuid references public.tenants(id) on delete cascade,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists admin_audit_tenant_idx on public.admin_audit(target_tenant_id);
create index if not exists admin_audit_created_idx on public.admin_audit(created_at desc);


-- 6) RLS — TODAS essas tabelas: admin lê/escreve tudo, cliente vê o seu -

-- plans: leitura pública pra landing/checkout, escrita só admin
alter table public.plans enable row level security;
drop policy if exists "plans_read_all"  on public.plans;
drop policy if exists "plans_write_admin" on public.plans;
create policy "plans_read_all"   on public.plans for select using (true);
create policy "plans_write_admin" on public.plans for all
  using    (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- modules_catalog: leitura pública (frontend monta cards), escrita só admin
alter table public.modules_catalog enable row level security;
drop policy if exists "modules_read_all"   on public.modules_catalog;
drop policy if exists "modules_write_admin" on public.modules_catalog;
create policy "modules_read_all"   on public.modules_catalog for select using (true);
create policy "modules_write_admin" on public.modules_catalog for all
  using    (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- payments: cliente vê só os do próprio tenant, admin vê tudo
alter table public.payments enable row level security;
drop policy if exists "payments_read_own"   on public.payments;
drop policy if exists "payments_admin_all"  on public.payments;
create policy "payments_read_own" on public.payments for select using (
  public.has_role(auth.uid(), 'admin')
  or tenant_id in (select tenant_id from public.profiles where id = auth.uid())
);
create policy "payments_admin_all" on public.payments for all
  using    (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- admin_audit: só admin vê e escreve
alter table public.admin_audit enable row level security;
drop policy if exists "audit_admin_only" on public.admin_audit;
create policy "audit_admin_only" on public.admin_audit for all
  using    (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));


-- 7) Política GLOBAL: admin pode ver/editar TUDO -----------------------
-- (adiciona políticas extras pra admin nas tabelas de negócio)
do $$ begin
  -- tenants
  if not exists (select 1 from pg_policies where tablename='tenants' and policyname='admin_all_tenants') then
    create policy "admin_all_tenants" on public.tenants for all
      using    (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
  -- profiles
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='admin_all_profiles') then
    create policy "admin_all_profiles" on public.profiles for all
      using    (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
  -- tenant_module_access
  if not exists (select 1 from pg_policies where tablename='tenant_module_access' and policyname='admin_all_tma') then
    create policy "admin_all_tma" on public.tenant_module_access for all
      using    (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
  -- units
  if not exists (select 1 from pg_policies where tablename='units' and policyname='admin_all_units') then
    create policy "admin_all_units" on public.units for all
      using    (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
  -- user_roles (admin gerencia roles)
  if not exists (select 1 from pg_policies where tablename='user_roles' and policyname='admin_all_user_roles') then
    create policy "admin_all_user_roles" on public.user_roles for all
      using    (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
end $$;


-- 8) RPC admin_set_plan: troca plano de um tenant + propaga max_units --
create or replace function public.admin_set_plan(_tenant uuid, _plan uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_units int;
  v_modules text[];
  v_caller uuid := auth.uid();
begin
  -- só admin pode chamar
  if not public.has_role(v_caller, 'admin') then
    raise exception 'forbidden: admin only';
  end if;

  select max_units, module_slugs into v_max_units, v_modules
  from public.plans where id = _plan;

  if v_max_units is null then
    raise exception 'plan not found';
  end if;

  -- atualiza tenant
  update public.tenants set plan_id = _plan where id = _tenant;

  -- propaga max_units pros módulos do tenant
  update public.tenant_module_access
     set max_units = v_max_units
   where tenant_id = _tenant;

  -- ativa módulos que vieram no plano e ainda não existem
  insert into public.tenant_module_access (tenant_id, module_slug, status, max_units)
  select _tenant, unnest(v_modules), 'active', v_max_units
  on conflict (tenant_id, module_slug) do update
    set status = 'active', max_units = excluded.max_units;

  -- audita
  insert into public.admin_audit (admin_user_id, action, target_tenant_id, metadata)
  values (v_caller, 'plan_changed', _tenant, jsonb_build_object('plan_id', _plan));
end;
$$;

grant execute on function public.admin_set_plan(uuid, uuid) to authenticated;


-- 9) RPC admin_toggle_module: ativa/desativa módulo manual -------------
create or replace function public.admin_toggle_module(
  _tenant uuid, _module text, _status text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_caller uuid := auth.uid();
begin
  if not public.has_role(v_caller, 'admin') then
    raise exception 'forbidden: admin only';
  end if;
  if _status not in ('active','trial','blocked') then
    raise exception 'invalid status';
  end if;

  insert into public.tenant_module_access (tenant_id, module_slug, status, max_units)
  values (_tenant, _module, _status, 1)
  on conflict (tenant_id, module_slug) do update set status = excluded.status;

  insert into public.admin_audit (admin_user_id, action, target_tenant_id, metadata)
  values (v_caller, 'module_' || _status, _tenant,
          jsonb_build_object('module_slug', _module));
end;
$$;
grant execute on function public.admin_toggle_module(uuid, text, text) to authenticated;


-- 10) View de métricas ------------------------------------------------
create or replace view public.v_admin_metrics as
select
  (select count(*) from public.tenants) as total_tenants,
  (select count(*) from public.tenants where subscription_status = 'active')   as active_tenants,
  (select count(*) from public.tenants where subscription_status = 'trial')    as trial_tenants,
  (select count(*) from public.tenants where subscription_status = 'overdue')  as overdue_tenants,
  (select count(*) from public.tenants where created_at > now() - interval '30 days') as new_tenants_30d,
  (select coalesce(sum(p.price_monthly),0)
     from public.tenants t join public.plans p on p.id = t.plan_id
     where t.subscription_status = 'active') as mrr,
  (select coalesce(sum(amount),0) from public.payments
     where status='CONFIRMED' and paid_at > date_trunc('month', now())) as revenue_this_month;

grant select on public.v_admin_metrics to authenticated;

-- =====================================================================
-- FIM. Dúvidas? Veja .lovable/plan.md
-- =====================================================================
