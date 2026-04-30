-- =========================================================
-- Promove o usuário a Super Admin (role global 'admin').
-- Rode UMA VEZ no Supabase SQL Editor.
-- Depois disso, gerencie outros admins pela UI em /admin/usuarios.
-- =========================================================

-- 1) Substitua o e-mail abaixo pelo e-mail com o qual você loga no Hub.
--    (mantenha as aspas simples)
do $$
declare
  v_email text := 'TROQUE_PELO_SEU_EMAIL@exemplo.com';
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    raise exception 'Usuário com email % não encontrado em auth.users', v_email;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'admin'::app_role)
  on conflict (user_id, role) do nothing;

  raise notice 'OK: % agora é admin (user_id=%).', v_email, v_user_id;
end $$;

-- 2) Conferir:
-- select u.email, r.role
-- from public.user_roles r
-- join auth.users u on u.id = r.user_id
-- where r.role = 'admin';
