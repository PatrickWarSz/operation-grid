# Resposta às 3 perguntas + ajustes pendentes

## 1. Os satélites e o `satellite-template.md` precisam mudar?

**Não, nada quebra nos satélites.** Tudo que fizemos no Hub na Etapa A é interno:

| Mudança Etapa A | Afeta satélite? |
|---|---|
| Tabelas novas (`plans`, `modules_catalog`, `payments`, `admin_audit`) | ❌ Não — satélite só lê `tenant_module_access` |
| RPCs `admin_set_plan`, `admin_toggle_module` | ❌ Não — só o painel admin chama |
| View `v_admin_metrics` | ❌ Não |
| Rotas `/admin/*` no Hub | ❌ Não |
| Handoff de sessão, `tenant_module_access`, `units`, `user_units` | ✅ Continuam idênticos |

O contrato Hub ↔ satélite (handoff por fragment + RLS por `tenant_id`/`unit_id` + leitura de `tenant_module_access`) **não mudou**. O `satellite-template.md` segue válido como está.

**Só vai mudar quando entrarmos na Etapa B (Asaas)** — e mesmo aí, a única coisa que o satélite vai sentir é: quando o pagamento vencer, o webhook flipa `tenant_module_access.status = 'blocked'` e o satélite (que já checa isso) automaticamente bloqueia o acesso. Zero código novo no satélite.

## 2. Como logar como admin

Hoje seu usuário tem `role = 'owner'` no tenant, mas **`role = 'admin'` é uma coisa separada**, na tabela `user_roles` global (não vinculada a tenant). Você precisa rodar um INSERT manual uma única vez pra se promover. Depois disso, qualquer outro admin você cria pela UI em `/admin/usuarios`.

Vou criar o arquivo `supabase/promote_me_admin.sql` com:

```sql
-- Rode no SQL Editor (Supabase) UMA VEZ.
-- Substitua o e-mail pelo seu se for diferente.
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'SEU_EMAIL_AQUI'
on conflict (user_id, role) do nothing;
```

Depois de rodar:
1. Faça **logout e login** no Hub (pra recarregar o contexto de auth com a nova role).
2. No menu lateral aparece **"Painel do Sistema"** → leva pra `/admin`.
3. Lá dentro, em `/admin/usuarios`, você promove/revoga outros admins pela UI sem mexer em SQL nunca mais.

> Sobre subdomínio `admin.seuhub.com`: por enquanto o painel vive em `/admin` no mesmo domínio (funciona igual, com proteção `beforeLoad` checando `hasRole('admin')`). Quando você apontar o DNS `admin.hubnexus.com` pro projeto, a gente adiciona um middleware que **só** serve `/admin/*` nesse host e bloqueia `/app/*` — sem reescrever nada.

## 3. Bug a corrigir agora

A renomeação `admin.novidades.tsx` ficou pela metade: o arquivo antigo `src/routes/_authenticated/app.novidades.tsx` ainda existe (causando o erro de runtime que você viu) **e** o `routeTree.gen.ts` lista as duas rotas. Vou:

- Deletar `src/routes/_authenticated/app.novidades.tsx` (já existe a versão em `_admin/admin.novidades.tsx`).
- Remover o link "Novidades" do menu cliente em `src/routes/_authenticated.tsx` (novidades agora é só admin — clientes leem via outro lugar, ou voltamos com leitura pra cliente depois se você quiser).

> Se você quer **manter** a página de leitura de novidades pros clientes (`/app/novidades`) e só editar pelo admin, me avisa que eu deixo a do cliente como leitura e a do admin como editor. Default do plano: remover do cliente.

---

## Arquivos a alterar

- **Criar** `supabase/promote_me_admin.sql` (script único pra você rodar)
- **Deletar** `src/routes/_authenticated/app.novidades.tsx`
- **Editar** `src/routes/_authenticated.tsx` (tirar item de menu "Novidades" do cliente)

Aprova?