
# Contrato de Integração Hub Nexus ↔ Apps Satélite

Este é o documento que você leva pro chat do Estoque Pro. Cobre as 6 decisões que ele pediu **e** lista o que precisa ser feito de cada lado pra o Estoque Pro virar o primeiro app satélite real.

## Visão geral da arquitetura acordada

```text
   estoquemat.lovable.app  ──┐
   devolucoes.hubnexus.com ──┤   (landings + workspaces dos apps)
   futuros apps...         ──┘
                              │
                              │  mesma sessão Supabase
                              ▼
   hubnexusgrid.lovable.app  ── auth + billing + catálogo + tenant_module_access
                              │
                              ▼
                          Supabase ÚNICO
                  (auth.users, public.tenants,
                   public.profiles, public.tenant_module_access,
                   tabelas próprias de cada app)
```

Regra de ouro: **uma conta Hub Nexus por email, um tenant por empresa, módulos plugam por linha em `tenant_module_access`.** O app satélite nunca cria conta, nunca cobra, nunca decide se libera acesso — ele só consulta.

---

## Respostas às 6 perguntas do Estoque Pro

### 1. Credenciais do Supabase compartilhado

O app satélite usa as **mesmas** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do Hub. Isso é o que faz a sessão ser reaproveitada (item 3 abaixo).

No `.env` do Estoque Pro precisa ficar:

```
VITE_SUPABASE_URL=<mesma URL do Hub>
VITE_SUPABASE_PUBLISHABLE_KEY=<mesma anon key do Hub>
VITE_SUPABASE_PROJECT_ID=<mesmo project id>
```

Você (Patrick) pega esses valores no `.env` deste projeto Hub e cola lá. Nunca usar service role no cliente.

### 2. Modelo de tenant

Decisão: **`tenant_id`** (UUID, FK pra `public.tenants(id)`).

Tabelas-padrão que **já existem** no Supabase do Hub (resumo do que o `useWorkspace.tsx` consome):

```text
public.tenants (id, name, ...)
public.profiles (id = auth.users.id, tenant_id, full_name, segment, ...)
public.user_roles (user_id, role)            -- enum app_role: admin | user
public.tenant_module_access (tenant_id, module_id, status, trial_*)
public.v_module_access_effective              -- view com effective_status
public.tenant_branding, public.announcements, public.announcement_reads
RPC: public.start_module_trial(_module_id text)
```

Toda tabela nova do Estoque Pro **deve** ter:

```sql
tenant_id uuid not null references public.tenants(id) on delete cascade
```

E RLS sempre filtrando por `tenant_id = (select tenant_id from profiles where id = auth.uid())`.

### 3. Como a sessão chega no app satélite

Decisão: **opção (c) — Supabase Auth nativo, mesma URL+anon key, sessão lida do `localStorage` próprio do navegador**.

Por quê:
- Não exige domínio compartilhado (Estoque Pro está em `.lovable.app` próprio).
- Não envolve passar token na URL (vazaria em logs).
- O Supabase JS já persiste a sessão por padrão (`persistSession: true`).
- Como Hub e satélite usam a **mesma URL Supabase**, o token JWT do Hub vale no satélite.

**Fluxo concreto** (já está parcialmente codificado no Hub via `?intent=` e `?redirect=`):

```text
1) Cliente em estoquemat.lovable.app/ clica "Entrar" ou "Começar grátis".
2) Hub abre em hubnexusgrid.lovable.app/login?intent=estoque
   &redirect=https://estoquemat.lovable.app/app/estoque
3) Usuário faz login (ou signup) NO HUB. Sessão Supabase fica salva.
4) Hub redireciona para o redirect, e ANTES dispara start_module_trial('estoque')
   se ainda não tem acesso. (Isso já existe em src/routes/_authenticated/app.tsx.)
5) Estoque Pro abre. supabase-js inicializa, lê a sessão do storage local
   (mesmo project ref, mesma key, mesmo cookie/storage prefix → mesma sessão).
6) Estoque Pro consulta v_module_access_effective onde module_id='estoque'
   pra confirmar acesso ativo/trial. Se não, redireciona pro Hub.
```

Detalhe técnico crítico: o storage key do supabase-js é `sb-<project-ref>-auth-token`. Como ambos os apps usam o **mesmo project ref**, ambos leem a mesma chave — mas só dentro do **mesmo origin do navegador**. Como Hub e Estoque Pro estão em **origins diferentes** (`hubnexusgrid.lovable.app` vs `estoquemat.lovable.app`), localStorage **não** é compartilhado entre origins.

Por isso o passo (4) precisa fazer um **handoff explícito**. Duas opções viáveis:

- **(3a) Fragment handoff (recomendado, padrão Supabase OAuth):** Hub redireciona com `#access_token=...&refresh_token=...&expires_in=...`. O `supabase-js` no satélite, quando criado com `detectSessionInUrl: true` (já é o padrão), lê o fragment automaticamente e persiste a sessão. **Token vai no fragment, não na query — não aparece em logs de servidor.**
- **(3b) Login ocorre no satélite:** botões do Estoque Pro abrem `/login` **dentro do próprio domínio do satélite** (componente compartilhado, mas servido pelo satélite). A sessão é criada localmente. Mais simples mas duplica a tela.

Decisão recomendada: **(3a)**. Mantém o "auth 100% no Hub" e usa um mecanismo já testado pelo próprio Supabase.

### 4. Tabela de entitlements / assinaturas

Decisão: **`public.tenant_module_access` + view `public.v_module_access_effective`** (já existem).

Schema efetivo (resumo do que o Hub já usa):

```sql
public.tenant_module_access (
  tenant_id uuid references public.tenants(id),
  module_id text,                              -- ex: 'estoque', 'devolucoes'
  status text check (status in ('active','trial','blocked')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  primary key (tenant_id, module_id)
);

-- view: aplica vencimento de trial
public.v_module_access_effective (
  tenant_id, module_id, status,
  effective_status,    -- 'active' | 'trial' | 'blocked' (já considera trial vencido)
  trial_days_left
);
```

Como o Estoque Pro consulta:

```ts
const { data } = await supabase
  .from('v_module_access_effective')
  .select('effective_status, trial_days_left')
  .eq('module_id', 'estoque')
  .maybeSingle();

if (!data || data.effective_status === 'blocked') {
  window.location.href = 'https://hubnexusgrid.lovable.app/programas/estoque';
}
```

A view já aplica RLS que filtra por `tenant_id` do usuário. Então essa query retorna **só a linha do tenant do usuário logado** — sem precisar passar tenant_id manualmente.

Quando o billing real entrar (Stripe/Paddle), o webhook vai escrever em `tenant_module_access` setando `status='active'`. Nada muda no satélite.

### 5. Card do app no Hub (catálogo)

O Hub mantém o catálogo em `src/lib/modules.ts`. O entry "estoque" já existe lá com metadata. Mudanças necessárias deste lado:

- Atualizar entrada `estoque` para refletir o produto real:
  - `name: "Estoque Pro"` (hoje está "Gestão de Estoque & Pedidos" — alinhar com a marca do satélite)
  - `price: 49` (hoje está 199 — alinhar com a landing)
  - `short`/`description`: focar em **fabricantes têxteis**
  - manter `id: "estoque"`, `icon: Boxes`
- Adicionar dois campos novos ao tipo `AppModule`:
  - `externalUrl?: string` — URL pública pra abrir o app satélite (`https://estoquemat.lovable.app/app/estoque`)
  - `landingUrl?: string` — URL da landing pública do programa (`https://estoquemat.lovable.app/`)
- Quando `externalUrl` está setado, o card do workspace (`/app`) abre o satélite num **novo tab com handoff de sessão** (ver item 3a) em vez de tentar renderizar `/apps/<slug>` em iframe interno.

### 6. Convenção de redirect

Confirmado: **`?intent=<slug>&redirect=<url-completa>`**.

O Hub já implementa em `login.tsx` e `signup.tsx`. Comportamento:
- Após auth bem-sucedido, navega pra `redirect` preservando `?intent=<slug>`.
- A rota `/app` lê `?intent=`, chama `start_module_trial(intent)` e redireciona.

Para o handoff de sessão (item 3a), o Hub precisa de uma **mudança nova**: quando `redirect` aponta pra um domínio externo conhecido (lista whitelist), em vez de só navegar, ele anexa o fragment `#access_token=...&refresh_token=...` extraído da sessão atual. Isso é o que falta hoje.

---

## O que precisa mudar no HUB (este projeto)

1. **Atualizar catálogo (`src/lib/modules.ts`)**
   - Entry `estoque`: nome "Estoque Pro", preço R$ 49, descrição alinhada (fabricantes têxteis), adicionar `externalUrl` e `landingUrl`.
   - Estender o tipo `AppModule` com esses dois campos opcionais.

2. **Criar helper `src/lib/satellite-handoff.ts`**
   - Whitelist de domínios satélite confiáveis (`estoquemat.lovable.app`, futuros).
   - Função `buildSatelliteUrl(externalUrl, session)` que monta a URL com fragment `#access_token=...&refresh_token=...&expires_in=...&token_type=bearer&type=recovery` (mesmo formato do retorno OAuth do Supabase, que o satélite já saberá ler).

3. **Ajustar abertura de cards no workspace**
   - `src/routes/_authenticated/app.tsx` (`ActiveProgramCard`): se `module.externalUrl` existir, em vez de `<Link>` interno, renderizar `<a target="_blank">` com URL de handoff.
   - `src/routes/_authenticated/app.programas.$slug.tsx`: se módulo tem `externalUrl`, mostrar botão "Abrir Estoque Pro" em vez do iframe `/apps/<slug>`.

4. **Ajustar landing custom (`src/routes/programas.$slug.tsx`)**
   - Quando `slug='estoque'`, o CTA "Começar grátis" pode abrir direto `estoquemat.lovable.app` (que já manda de volta pro Hub login). Manter o CTA atual também funciona — fica na mão do usuário.
   - Adicionar link "Conhecer página completa" → `landingUrl`.

5. **Ajustar fluxo pós-login no `/app`**
   - Quando `?intent=estoque` for recebido e o módulo tiver `externalUrl`: depois de iniciar trial, redirecionar pro satélite com handoff (não pra `/app/programas/estoque`).

6. **Documentar `/login` e `/signup` aceitando `redirect` externo**
   - Hoje o `redirectTarget` é tratado como path interno. Precisa aceitar URL absoluta e validar contra whitelist de domínios satélite. Senão é vetor de open redirect.

7. **Memória do projeto (`mem://index.md`)**
   - Registrar a regra "apps satélite usam handoff via fragment, lista de domínios confiáveis em `src/lib/satellite-handoff.ts`".

---

## O que precisa mudar no ESTOQUE PRO (outro projeto)

1. **Instalar `@supabase/supabase-js`** e criar `src/lib/supabase.ts` com a mesma URL+anon key do Hub.
2. **Aceitar handoff de sessão na entrada**
   - Em `App.tsx` ou no entry `/app/estoque`, criar o cliente com `detectSessionInUrl: true` (default já basta) — o `supabase-js` lê o fragment e persiste sozinho.
3. **Guardião de sessão + entitlement**
   - Hook `useHubSession()` que: (a) checa `supabase.auth.getSession()`, (b) se ausente, redireciona pra `hubLoginUrl()`, (c) se presente, consulta `v_module_access_effective` para `module_id='estoque'`, (d) se `effective_status === 'blocked'`, redireciona pra landing do programa no Hub.
4. **Mostrar usuário logado na TopBar**
   - Ler `supabase.auth.getUser()` + `profiles.full_name`.
5. **Botão de logout**
   - `await supabase.auth.signOut()` + `window.location.href = HUB_BASE_URL`.
6. **Migrar dados de `localStorage` (zustand persist) pro Supabase**
   - Criar tabelas `estoque_categorias`, `estoque_itens`, `estoque_movimentacoes`, `estoque_pedidos`, `estoque_fornecedores`, todas com `tenant_id` + RLS.
   - Manter zustand como cache local; sync via Supabase.
   - Fornecer migração one-shot do localStorage existente pro tenant do usuário.
7. **Atualizar `src/lib/hub.ts`** se a convenção de redirect mudou (não mudou — `?intent=&redirect=` continua).

---

## Plano de execução nesta sessão

Quando você aprovar, eu faço **só os passos do lado Hub** (1 a 7 acima). O lado Estoque Pro você leva pro outro chat com este documento.

Ordem:

```text
[1] Estender tipo AppModule (externalUrl, landingUrl) e atualizar entry 'estoque'
[2] Criar src/lib/satellite-handoff.ts (whitelist + builder de URL)
[3] Validar redirect externo em login.tsx e signup.tsx (whitelist)
[4] Ajustar app.tsx para abrir satélites com handoff
[5] Ajustar app.programas.$slug.tsx (botão externo quando aplicável)
[6] Atualizar mem://index.md
```

Sem mexer em banco. Sem mexer no fluxo de auth atual além de aceitar redirect externo whitelisted.

## O que NÃO entra agora

- Migração dos dados do Estoque Pro pro Supabase (é tarefa do outro chat).
- Criação das tabelas `estoque_*` no Supabase (vem depois, junto com o trabalho do satélite).
- Billing real / Stripe (segue postergado, conforme já decidido).
- SSO entre múltiplos satélites simultâneos (resolvido naturalmente porque cada um faz handoff sob demanda).

## Pergunta final pra você antes de executar

Só uma coisa pra confirmar: o nome do módulo no catálogo do Hub. Hoje está "Gestão de Estoque & Pedidos". O satélite se chama "Estoque Pro". Posso renomear pra **"Estoque Pro"** no Hub também (mantém consistência de marca) ou você prefere manter "Gestão de Estoque & Pedidos" no catálogo e tratar "Estoque Pro" como nome comercial do satélite? Eu recomendo **renomear pra "Estoque Pro"** — uma marca só por produto, mais limpo.
