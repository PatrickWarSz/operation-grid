-- =====================================================================
-- FIX TUDO DE UMA VEZ: admin + view do satélite + seed do trial
-- Rode INTEIRO no SQL Editor do Supabase. É idempotente (pode rodar 2x).
-- =====================================================================
-- ANTES DE RODAR: troque a string SEU_EMAIL_AQUI no FINAL do arquivo
-- pelo e-mail com o qual você loga no Hub.
-- =====================================================================


-- 1) Garante UNIQUE(user_id, role) em user_roles --------------------
-- (era o erro do "ON CONFLICT" do promote_me_admin)
do $$
begin
  -- limpa duplicatas se existirem
  delete from public.user_roles a
  using public.user_roles b
  where a.ctid < b.ctid
    and a.user_id = b.user_id
    and a.role    = b.role;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and conname  = 'user_roles_user_id_role_key'
  ) then
    alter table public.user_roles
      add constraint user_roles_user_id_role_key unique (user_id, role);
  end if;
end $$;


-- 2) View que o satélite vai consultar -------------------------------
-- O Estoque (e qualquer satélite) precisa de:
--   module_id, effective_status (active|trial|blocked), trial_days_left
-- A tabela base é tenant_module_access (módulo por tenant).
-- RLS: o satélite usa a sessão do user, então a view filtra pelo
-- tenant do auth.uid() automaticamente (sem precisar de policy nova
-- porque é uma view security_invoker que herda RLS de profiles+TMA).
create or replace view public.v_module_access_effective
with (security_invoker = true)
as
select
  tma.module_slug                                  as module_id,
  tma.status                                       as effective_status,
  case
    when t.subscription_status = 'trial' and t.trial_ends_at is not null
      then greatest(0, extract(day from (t.trial_ends_at - now()))::int)
    else null
  end                                              as trial_days_left,
  tma.tenant_id,
  tma.max_units
from public.tenant_module_access tma
join public.tenants  t on t.id = tma.tenant_id
join public.profiles p on p.tenant_id = tma.tenant_id
where p.id = auth.uid();

grant select on public.v_module_access_effective to authenticated;


-- 3) Garante que profiles tem RLS de leitura do próprio user ---------
-- (necessário pro satélite ler full_name)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles'
      and policyname = 'profiles_self_read'
  ) then
    create policy "profiles_self_read" on public.profiles
      for select to authenticated
      using (id = auth.uid());
  end if;
end $$;


-- 4) Promove você a SUPER ADMIN --------------------------------------
-- ⚠️ TROQUE O EMAIL ABAIXO antes de rodar!
do $$
declare
  v_email   text := 'SEU_EMAIL_AQUI@exemplo.com';   -- 👈 TROQUE
  v_user_id uuid;
  v_tenant  uuid;
begin
  select id, tenant_id into v_user_id, v_tenant
  from public.profiles
  where id = (select id from auth.users where email = v_email);

  if v_user_id is null then
    raise exception 'Usuário com email % não encontrado. Crie a conta primeiro no Hub.', v_email;
  end if;

  -- 4a) vira admin global
  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin'::app_role)
  on conflict (user_id, role) do nothing;

  -- 4b) seed de TRIAL pro módulo estoque (pra você testar o handoff)
  if v_tenant is not null then
    insert into public.tenant_module_access (tenant_id, module_slug, status, max_units)
    values (v_tenant, 'estoque', 'trial', 1)
    on conflict (tenant_id, module_slug) do update
      set status = case
                     when public.tenant_module_access.status = 'blocked'
                       then 'trial'
                     else public.tenant_module_access.status
                   end;

    -- garante que o tenant tem trial_ends_at definido (7 dias)
    update public.tenants
       set subscription_status = coalesce(nullif(subscription_status,''), 'trial'),
           trial_ends_at = coalesce(trial_ends_at, now() + interval '7 days')
     where id = v_tenant;
  end if;

  raise notice 'OK: % é admin (user_id=%) e tenant % tem trial do estoque.',
               v_email, v_user_id, v_tenant;
end $$;


-- 5) Conferência final -----------------------------------------------
-- Rode estes selects pra confirmar:
-- select email, role from auth.users u
--   join public.user_roles r on r.user_id = u.id where r.role='admin';
-- select * from public.v_module_access_effective;
