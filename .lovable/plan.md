# Painel Admin + Cobrança Asaas

Construir um painel de gerenciamento separado e integrar pagamento recorrente via Asaas com trial automático de 7 dias.

---

## Arquitetura geral

Separamos o sistema em **3 espaços** mentalmente distintos, todos no mesmo projeto:

```text
seuhub.com/                      → landing pública (já existe)
seuhub.com/app/*                 → workspace do CLIENTE (já existe)
seuhub.com/admin/*               → painel do DONO (novo)
```

Hoje você usa `/admin` no mesmo subdomínio. Quando quiser migrar pra `admin.seuhub.com`, é só apontar um CNAME — o código já fica preparado pra isso (mesmo build, host diferente). Não precisa refazer nada.

**Visual do `/admin`:** sidebar própria (cor diferente, badge "Painel do Sistema" no topo, ícones diferentes) pra deixar óbvio que você não está vendo o que cliente vê.

---

## Parte 1 — Painel Admin (`/admin/*`)

### Páginas

1. **`/admin`** — Dashboard
   - Cards: total clientes, MRR, trials ativos, inadimplentes, novos no mês
   - Atividade recente (últimas ativações, pagamentos, cancelamentos)

2. **`/admin/clientes`** — Lista de tenants
   - Busca por nome/email
   - Filtros: ativos, em trial, inadimplentes, cancelados
   - Click → detalhe do cliente

3. **`/admin/clientes/$id`** — Detalhe de um cliente
   - Dados da empresa, dono, unidades, usuários
   - Seção "Módulos contratados" com toggle por módulo (Ativo / Trial / Bloqueado)
   - Seção "Plano" com botão pra trocar (Starter / Growth / Pro)
   - Seção "Pagamentos" — histórico de cobranças Asaas
   - Botão "Liberar trial manual" / "Cancelar" / "Reativar"

4. **`/admin/modulos`** — Catálogo
   - Editar nome, descrição, preços, status (disponível / em breve)
   - Sincroniza com `src/lib/modules.ts` via tabela `modules_catalog`

5. **`/admin/planos`** — Planos & preços
   - Criar/editar planos (Starter R$X, Growth R$Y, etc.)
   - Definir quais módulos cada plano inclui e `max_units`

6. **`/admin/usuarios`** — Usuários globais
   - Lista de todos os profiles
   - Promover/remover Super Admin

7. **`/admin/novidades`** — Já existe (`admin.novidades.tsx`)
   - Mantém como está, só move pro novo layout

8. **`/admin/financeiro`** — Pagamentos Asaas
   - Lista de cobranças (pagas, pendentes, vencidas)
   - Total recebido no mês

### Proteção

Layout `_admin.tsx` com `beforeLoad` checando `auth.hasRole('admin')` no servidor. Quem não é admin é redirecionado pra `/app`. Sem flash de tela.

---

## Parte 2 — Integração Asaas

### Fluxo de assinatura (cliente novo)

```text
1. Visitante na landing → escolhe plano → clica "Assinar"
2. Cria conta no Hub (signup normal)
3. Backend cria customer + subscription no Asaas (trial 7 dias)
4. Cliente recebe email do Asaas com link de pagamento
5. Cliente entra no /app — trial já ativo, todos módulos do plano liberados
6. Dia 7: Asaas cobra automaticamente (Pix/Boleto/Cartão escolhido)
7. Webhook recebe "PAYMENT_CONFIRMED" → mantém ativo
   ou "PAYMENT_OVERDUE" → bloqueia módulos depois de N dias de carência
```

### Fluxo de renovação mensal

Asaas cobra sozinho todo mês. Webhook atualiza status:
- `PAYMENT_CONFIRMED` → tudo continua
- `PAYMENT_OVERDUE` → marca tenant como inadimplente, envia notificação
- 7 dias depois ainda sem pagar → bloqueia acesso aos módulos (mantém login)

### O que precisa

- **Conta Asaas** (você cria em asaas.com — sandbox grátis pra testar)
- **API key Asaas** — você me passa, salvo em secret `ASAAS_API_KEY`
- **Webhook secret** — gerado por nós, configurado no painel Asaas
- **URL de webhook**: `https://hubnexusgrid.lovable.app/api/public/asaas-webhook`

---

## Banco de dados (mudanças)

```sql
-- Tabela de planos
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,         -- starter, growth, pro
  name text not null,
  price_monthly numeric not null,
  max_units int not null default 1,
  module_slugs text[] not null,      -- ['estoque','financeiro']
  active boolean default true,
  created_at timestamptz default now()
);

-- Catálogo de módulos editável (espelha src/lib/modules.ts)
create table public.modules_catalog (
  slug text primary key,
  name text not null,
  short text,
  description text,
  price_monthly numeric,
  status text default 'available',   -- available, coming_soon
  external_url text,
  updated_at timestamptz default now()
);

-- Tenant: vínculo com plano e Asaas
alter table public.tenants
  add column plan_id uuid references public.plans(id),
  add column asaas_customer_id text,
  add column asaas_subscription_id text,
  add column subscription_status text default 'trial',  -- trial, active, overdue, cancelled
  add column trial_ends_at timestamptz,
  add column current_period_end timestamptz;

-- Histórico de pagamentos
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  asaas_payment_id text unique,
  amount numeric not null,
  status text not null,              -- PENDING, CONFIRMED, OVERDUE, REFUNDED
  billing_type text,                 -- PIX, BOLETO, CREDIT_CARD
  due_date date,
  paid_at timestamptz,
  invoice_url text,
  created_at timestamptz default now()
);

-- Auditoria de ações admin
create table public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id),
  action text not null,              -- module_activated, plan_changed, trial_granted...
  target_tenant_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- RLS: admin lê tudo, cliente só vê o seu
-- (políticas usando has_role(auth.uid(), 'admin'))

-- RPC pra mudança de plano (propaga max_units e módulos)
create or replace function public.admin_set_plan(_tenant uuid, _plan uuid)
returns void security definer ...
```

Você roda esse SQL uma vez. Depois é tudo via painel.

---

## Detalhes técnicos

### Server functions (TanStack `createServerFn`)

- `getAdminMetrics()` — métricas do dashboard
- `listTenants(filter)` — lista clientes com paginação
- `getTenantDetail(id)` — detalhe completo
- `setTenantPlan(tenantId, planId)` — chama RPC + atualiza assinatura no Asaas
- `toggleModule(tenantId, moduleSlug, status)` — ativa/desativa módulo manual
- `grantManualTrial(tenantId, days)` — libera trial extra
- `cancelSubscription(tenantId)` — cancela no Asaas e marca tenant
- `createSubscription(tenantId, planSlug)` — cria customer+subscription no Asaas com 7 dias trial
- Todas com `requireSupabaseAuth` + check `has_role('admin')` exceto `createSubscription` (chamada no signup)

### Webhook Asaas

`src/routes/api/public/asaas-webhook.ts` — server route público:
- Verifica assinatura HMAC
- Eventos tratados: `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`, `SUBSCRIPTION_CANCELLED`
- Atualiza `tenants.subscription_status` e insere em `payments`
- Se overdue > 7 dias → bloqueia módulos via `tenant_module_access.status = 'blocked'`

### Cliente Asaas

`src/server/asaas.server.ts` — wrapper REST com `process.env.ASAAS_API_KEY`. Endpoints usados:
- `POST /customers` — cria cliente
- `POST /subscriptions` — cria assinatura recorrente
- `GET /payments?subscription=...` — lista cobranças
- `DELETE /subscriptions/{id}` — cancela
- `PUT /subscriptions/{id}` — troca plano

### Layout admin

- `src/routes/_admin.tsx` — layout protegido (admin only)
- `src/routes/_admin/admin.tsx` → `/admin` (dashboard)
- `src/routes/_admin/admin.clientes.tsx` etc.
- `src/components/admin/AdminSidebar.tsx` — sidebar visualmente diferente (escura, ícones distintos, badge "SISTEMA")
- Move `admin.novidades.tsx` → `_admin/admin.novidades.tsx`

---

## Ordem de implementação

**Etapa A — Esqueleto admin (sem Asaas)**
1. SQL: `plans`, `modules_catalog`, alterar `tenants`, `payments`, `admin_audit`, RLS, RPC
2. Layout `_admin` + sidebar + dashboard
3. Página clientes (lista + detalhe + toggle de módulos manual)
4. Página planos + módulos catálogo
5. Página usuários + financeiro vazio
6. Move admin.novidades pro novo layout

✅ **Aqui você já consegue gerenciar tudo pelo painel sem SQL.**

**Etapa B — Asaas**
7. Wrapper `asaas.server.ts` + secret `ASAAS_API_KEY`
8. Webhook `/api/public/asaas-webhook` (sandbox primeiro)
9. Server function `createSubscription` no fluxo de signup
10. Página financeiro funcional (lista pagamentos)
11. Botão "ver fatura" no detalhe do cliente
12. Job de bloqueio automático de inadimplentes (cron via pg_cron)

✅ **Aqui o sistema cobra sozinho.**

**Etapa C — Polish**
13. Email de boas-vindas, fim de trial, cobrança vencida
14. Página de "minha assinatura" pro cliente (`/app/configuracoes/assinatura`)
15. Métricas avançadas (churn, LTV, cohort)

---

## O que você precisa providenciar

1. **Antes da Etapa A**: nada. Eu já começo.
2. **Antes da Etapa B**: criar conta em asaas.com (sandbox grátis), gerar API key e me passar.

## Riscos e mitigação

- **Asaas fora do ar** → webhook com retry; cliente não fica bloqueado por instabilidade.
- **Cliente reclama de cobrança indevida** → painel admin tem botão "estornar" que chama Asaas.
- **Você esquece de pagar uma conta Asaas** → módulos continuam ativos pros clientes (status local não depende da conexão Asaas em runtime).
- **Sem `process.env` no Cloudflare Worker pra rotas isomórficas** → toda chamada Asaas roda em `createServerFn` ou server route, nunca em loader/componente.

---

## Resumo

Etapa A entrega o painel admin completo (você gerencia tudo visualmente, fim do SQL na mão).
Etapa B liga o Asaas (cobrança automática mensal, trial 7 dias, bloqueio automático).
Etapa C é refinamento.

Aprova começar pela Etapa A?
