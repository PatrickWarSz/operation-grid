## 📋 PROMPT — Novo App Satélite Hub Nexus

Cole este prompt num projeto Lovable novo para que ele já nasça pronto para ser plugado ao Hub Nexus.

---

````
Crie um novo app SaaS MVP que será um APP SATÉLITE do Hub Nexus.

═══════════════════════════════════════════════════════
CONTEXTO ARQUITETURAL — LEIA ANTES DE QUALQUER CÓDIGO
═══════════════════════════════════════════════════════

Este app NÃO é standalone.

- Hub Nexus (hubnexusgrid.lovable.app) é o centro: auth, billing, catálogo,
  perfil, tenants, módulos.
- Este app é um SATÉLITE: roda no próprio domínio (.lovable.app dele),
  consome o MESMO projeto Supabase do Hub, e nunca implementa login/signup
  nem cobrança próprios.
- Uma conta Hub Nexus por email. Um tenant por empresa.
  Acesso ao módulo é uma linha em public.tenant_module_access.

═══════════════════════════════════════════════════════
REGRAS DURAS (NÃO QUEBRE)
═══════════════════════════════════════════════════════

1. NÃO criar telas de login, signup, recuperação de senha, perfil,
   billing, planos. Isso vive no Hub.
2. NÃO criar tabela própria de "users" ou "accounts".
   Usar auth.users + public.profiles + public.tenants do Hub.
3. TODA tabela nova OBRIGATORIAMENTE tem coluna
   `tenant_id uuid not null references public.tenants(id) on delete cascade`
   e RLS filtrando por tenant do usuário logado.
4. NÃO armazenar dados de negócio em localStorage como fonte da verdade.
   localStorage só como cache. Fonte da verdade = Supabase.
5. Usar EXATAMENTE a mesma `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_PUBLISHABLE_KEY` do Hub. Nunca service role no cliente.
6. Sessão do usuário chega via handoff por fragment OAuth do Supabase
   (`#access_token=...&refresh_token=...`). O cliente Supabase já lê
   isso automaticamente com `detectSessionInUrl: true` (default).

═══════════════════════════════════════════════════════
IDENTIDADE DO APP (preencha)
═══════════════════════════════════════════════════════

- Nome comercial:        <ex: Estoque Pro>
- Slug do módulo:        <ex: estoque>   ← este é o module_id no Hub
- Tagline:               <…>
- Nicho:                 <…>
- Cor primária (HSL):    <ex: 22 92% 45%>
- Fonte:                 <ex: Inter>
- Tema padrão:           <light|dark>
- Preço sugerido (BRL):  <ex: 49>
- Domínio satélite:      <ex: meuapp.lovable.app>
- Domínio do Hub:        hubnexusgrid.lovable.app

═══════════════════════════════════════════════════════
O QUE CONSTRUIR
═══════════════════════════════════════════════════════

1) Estrutura
   - TanStack Start + Tailwind v4 + shadcn (padrão Lovable).
   - Landing pública em `/` (hero, features, pricing, FAQ, CTA).
   - Workspace protegido em `/app/*`.
   - Rota `/handoff` que apenas garante que a sessão foi capturada
     do fragment e redireciona pra `/app`.

2) Cliente Supabase (`src/lib/supabase.ts`)
   - createClient(URL, ANON_KEY, { auth: { persistSession: true,
     autoRefreshToken: true, detectSessionInUrl: true } })
   - Mesma URL+anon key do Hub (vem das env vars).

3) Helper Hub (`src/lib/hub.ts`)
   - HUB_BASE_URL = "https://hubnexusgrid.lovable.app"
   - MODULE_ID = "<slug>"
   - hubLoginUrl(redirectTo?) → `${HUB}/login?intent=${MODULE_ID}&redirect=${encodeURIComponent(redirectTo ?? satelliteAppUrl())}`
   - hubSignupUrl(redirectTo?) → idem em /signup
   - hubLandingUrl() → `${HUB}/programas/${MODULE_ID}`
   - satelliteAppUrl() → URL absoluta de `/app` neste satélite.

4) Guardião de sessão + entitlement + unidade ativa (`src/hooks/useHubSession.ts`)
   - getSession(): se ausente → window.location.href = hubLoginUrl().
   - Ao detectar sessão pelo fragment, ler também `unit_id` (mesmo fragment)
     e salvar em `localStorage["hub:active_unit"]`. Se vier vazio, usar
     o que já estiver salvo; se não houver nada, buscar a unit primária do
     tenant via Supabase (`select id from units where tenant_id=? and is_primary`).
   - Se presente → consulta `public.v_module_access_effective`
     onde `module_id = MODULE_ID` (RLS já filtra por tenant).
   - Se `effective_status === 'blocked'` → redireciona pra hubLandingUrl().
   - Expor: { user, profile, tenantId, unitId, status, loading }.

5) Layout `/app/*`
   - TopBar mostra: nome do app, nome do usuário (de profiles.full_name),
     **nome da filial ativa (read-only)** com link "Trocar filial no Hub →"
     abrindo `${HUB_BASE_URL}/app` em nova guia,
     badge do status (`active` | `trial: N dias`), botão "Voltar ao Hub"
     (link pra HUB_BASE_URL/app), botão Sair.
   - Satélite NÃO tem switcher próprio de filial — fonte da verdade é o Hub.
   - Sair = `await supabase.auth.signOut(); window.location.href = HUB_BASE_URL;`

6) Landing pública (`/`)
   - CTAs principais ("Começar grátis", "Entrar") apontam pra
     hubSignupUrl() / hubLoginUrl() com redirect = satelliteAppUrl().
   - NÃO tem formulário de cadastro local.

7) Modelo de dados (multi-tenant + multi-unidade)
   - Toda tabela: `id uuid pk default gen_random_uuid()`,
     `tenant_id uuid not null references public.tenants(id) on delete cascade`,
     `unit_id uuid not null references public.units(id) on delete cascade`,
     `created_at`, `updated_at`.
   - RLS dupla (tenant + unit):
     ```sql
     alter table public.<tabela> enable row level security;
     create policy "tenant+unit read" on public.<tabela> for select
       using (
         tenant_id = (select tenant_id from public.profiles where id = auth.uid())
         and public.user_has_unit_access(auth.uid(), unit_id)
       );
     create policy "tenant+unit write" on public.<tabela> for all
       using (
         tenant_id = (select tenant_id from public.profiles where id = auth.uid())
         and public.user_has_unit_access(auth.uid(), unit_id)
       )
       with check (
         tenant_id = (select tenant_id from public.profiles where id = auth.uid())
         and public.user_has_unit_access(auth.uid(), unit_id)
       );
     ```
   - Em todo INSERT, setar `tenant_id` E `unit_id` a partir do hook (não confiar no client puro).
   - Toda query: `.eq('tenant_id', tenantId).eq('unit_id', unitId)`.

8) Estado local
   - Pode usar zustand/tanstack-query como cache.
   - Persistência em localStorage SÓ para preferências de UI (tema,
     filtros, colunas visíveis). Nunca dados de negócio.

9) Variáveis de ambiente (.env)
   ```
   VITE_SUPABASE_URL=<mesma do Hub>
   VITE_SUPABASE_PUBLISHABLE_KEY=<mesma do Hub>
   VITE_SUPABASE_PROJECT_ID=<mesmo do Hub>
   VITE_HUB_BASE_URL=https://hubnexusgrid.lovable.app
   VITE_MODULE_ID=<slug>
   ```

═══════════════════════════════════════════════════════
FLUXO DE ENTRADA (ESPECIFICAÇÃO)
═══════════════════════════════════════════════════════

a) Visitante chega em `/` (landing). Clica "Começar grátis".
b) Vai pro Hub: /signup?intent=<slug>&redirect=https://meuapp.lovable.app/app
c) Hub cria conta (ou loga), inicia trial do módulo via
   `start_module_trial('<slug>')` se necessário, e redireciona
   pro `redirect` com fragment `#access_token=...&refresh_token=...`.
d) Satélite carrega, supabase-js detecta o fragment, persiste sessão.
e) `useHubSession` valida acesso em `v_module_access_effective`.
f) Se ok → renderiza workspace. Se blocked → manda pra landing do Hub.

═══════════════════════════════════════════════════════
ENTREGÁVEIS DESTA PRIMEIRA LEVA
═══════════════════════════════════════════════════════

- Landing pública funcional com CTAs apontando pro Hub.
- `/app` protegido com guardião de sessão + entitlement.
- TopBar com user, status, botão Hub, botão Sair.
- Cliente Supabase configurado e helpers `hub.ts`, `useHubSession`.
- 1 tela de funcionalidade core do app já com tabela Supabase
  multi-tenant + RLS, pra provar o fluxo ponta-a-ponta.

NÃO entregue ainda: billing, telas de admin do tenant, convites,
trocas de plano. Tudo isso é responsabilidade do Hub.
````

---

## ✅ Checklist de aceite

- Auth 100% no Hub (zero login/signup local)
- Mesma URL+anon key Supabase do Hub
- Toda tabela com `tenant_id` + RLS por tenant do `auth.uid()`
- Sessão entra por fragment `#access_token=...` (default do supabase-js)
- Guardião lê `public.v_module_access_effective` e bloqueia se necessário
- Botão "Voltar ao Hub" e "Sair" sempre visíveis no `/app`
- Landing pública com CTAs apontando para `hubSignupUrl()` / `hubLoginUrl()`

## 🧩 Ajustes necessários no HUB para cada novo satélite

1. Adicionar entry em `src/lib/modules.ts` com `id`, `name`, `price`,
   `externalUrl` (URL do `/app` do satélite) e `landingUrl` (landing pública).
2. Adicionar o domínio do satélite na whitelist em
   `src/lib/satellite-handoff.ts`.
3. (Opcional) Criar landing custom do programa em
   `src/routes/programas.$slug.tsx` ou reusar a genérica.
