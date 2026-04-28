
# Landings por programa + Hub unificado (auth único)

## A grande ideia

Cada programa (começando por **Devoluções**) ganha sua **própria landing page rica** vendida como produto independente, mas **toda compra/cadastro cai no mesmo workspace** com **uma única identidade Hub**. Isso resolve o problema que você levantou: um cliente nunca cria "duas contas".

```text
   devolucoes.hubnexus.com  ─┐
   estoque.hubnexus.com     ─┤
   financeiro.hubnexus.com  ─┼──►  hubnexus.com/app   (workspace único)
   hubnexus.com (hub)       ─┘     auth.hubnexus.com  (login compartilhado)
```

## Como o cliente vivencia

### Entrada A — pela landing do Devoluções
1. Vê `devolucoes.hubnexus.com` com hero, features, depoimentos, ROI calculator, pricing próprio.
2. Clica "Começar grátis 7 dias" → vai para `auth.hubnexus.com/signup?intent=devolucoes`.
3. Cria conta (ou faz login se já existir email). É **a conta Hub**, mas a UI fala "sua conta Hub Nexus".
4. Cai direto em `hubnexus.com/app/programas/devolucoes` com o módulo já liberado em trial.
5. No header do workspace vê os outros programas. Banner discreto: *"Sua conta Hub Nexus dá acesso a +7 programas. Conhecer →"* (link para `hubnexus.com`).

### Entrada B — pela landing do Hub
1. Vê `hubnexus.com` com catálogo (já existe no `ModulesGrid`).
2. Clica num card de programa → vai para `devolucoes.hubnexus.com` (mesma landing pública).
3. Mesmo fluxo de signup → mesmo workspace.

### Entrada C — já é cliente, quer adicionar programa
1. Dentro do `/app`, vê módulo bloqueado → clica → trial 7 dias inicia (já existe `start_module_trial`).
2. Sem novo cadastro, sem confusão.

## Arquitetura técnica

### 1. Auth unificado (uma única origem)
- **Tudo aponta para o mesmo Supabase Auth** (já temos).
- Subdomínios das landings de programa **não** têm tela de login própria. Os botões "Entrar" / "Criar conta" redirecionam para `hubnexus.com/login` e `hubnexus.com/signup` (preservando `intent=<slug>` em query string).
- Após signup/login bem-sucedido, o workspace lê `intent` e:
  - inicia trial automático do módulo (`start_module_trial(intent)`)
  - faz `redirect` para `/app/programas/<intent>`
- Nenhum subdomínio precisa configurar Supabase Auth próprio. Zero CORS, zero cookies cross-domain.

### 2. Estrutura de rotas (uma única app, multi-domínio)
Mantemos **um único projeto TanStack Start** servindo todos os subdomínios. Detectamos o subdomínio no servidor e rendemos a landing certa:

```text
src/routes/
  index.tsx                      → hub (já existe)
  login.tsx, signup.tsx          → auth (já existe — passa a aceitar ?intent=)
  programas.$slug.tsx            → landing pública genérica (fallback)
  programas/devolucoes.tsx       → landing CUSTOM rica (primeira)
  _authenticated/app.*           → workspace (já existe)
```

Roteamento por subdomínio (no `__root.tsx` ou middleware leve):
- `devolucoes.hubnexus.com/` → renderiza `/programas/devolucoes`
- `devolucoes.hubnexus.com/precos` → âncora dentro da mesma landing
- `devolucoes.hubnexus.com/login` → 302 para `https://hubnexus.com/login?intent=devolucoes&redirect=...`

Isso preserva SEO independente por domínio (cada um tem `<title>`, OG image, sitemap próprios), com **uma única base de código**.

### 3. Landing custom de Devoluções (a primeira)
Nova rota `src/routes/programas/devolucoes.tsx` — você pediu "landing custom por programa", então não vai ser template genérico. Estrutura:
- **Hero** específico ("Pare de perder dinheiro com devoluções mal geridas")
- **Problema/Agitação** (números do varejo BR)
- **Demo visual** do dashboard (reusa `ProgramMock`)
- **Features detalhadas** (cards com screenshots)
- **ROI calculator** (input: devoluções/mês × ticket médio → economia projetada)
- **Depoimentos** (placeholders por enquanto)
- **Pricing** próprio (R$ 149/mês ou parte do Hub a partir de R$ 199)
- **Cross-sell sutil**: "Faz parte do Hub Nexus — conheça os outros 7 programas"
- **FAQ específico**
- **CTA final** com trial de 7 dias

### 4. Cross-sell em ambas direções
- **Landing do programa → Hub**: seção "Parte de algo maior" no meio/fim da página, link para `hubnexus.com`.
- **Landing do Hub → programa**: cards do `ModulesGrid` viram clicáveis (`Link to="/programas/$slug"`), abrindo a landing rica do programa.
- **Workspace → outras landings**: na página `/app/catalogo`, módulos têm botão "Ver página do programa" que abre `<slug>.hubnexus.com` em nova aba.

### 5. Signup com intent
`src/routes/signup.tsx` aceita `?intent=<slug>&redirect=<url>`:
- Mostra badge no topo: *"Você está criando sua conta para acessar Devoluções"*.
- Após cadastro, chama `start_module_trial('devolucoes')` automaticamente.
- Redireciona para `/app/programas/devolucoes`.

`src/routes/login.tsx` recebe os mesmos params e, se módulo não estiver ativo, oferece iniciar trial.

## Domínios — o que você precisa fazer

Isso depende de você ter os subdomínios DNS-prontos. Lovable suporta múltiplos custom domains por projeto:

1. Comprar `hubnexus.com` (ou usar o que já tem) em Project Settings → Domains.
2. Adicionar `devolucoes.hubnexus.com` como subdomínio CNAME apontando pra Lovable.
3. Repetir para próximos programas conforme lança.

**Antes disso funcionar em produção**, em dev usaremos rotas: `/programas/devolucoes` faz tudo. A detecção de subdomínio é feita por uma helper que retorna `null` em dev e o slug em produção. O resto da app não precisa saber.

## O que NÃO entra agora (você disse "sem pagamento")

- Stripe/Paddle integration — fica para depois.
- Por enquanto o botão "Assinar" inicia **trial de 7 dias** (sistema que já existe). Conversão paga será passo seguinte.

## Plano de execução (ordem)

1. **Adicionar suporte a `?intent=<slug>` em `signup.tsx` e `login.tsx`** + auto-start trial pós-cadastro.
2. **Criar landing custom `src/routes/programas/devolucoes.tsx`** completa (hero, ROI, features, depoimentos, pricing, cross-sell para Hub, FAQ, CTA).
3. **Tornar cards do `ModulesGrid` clicáveis** apontando para `/programas/$slug` (Devoluções primeiro, demais com placeholder genérico que reusa dados de `MODULES`).
4. **Criar template fallback `src/routes/programas.$slug.tsx`** para programas que ainda não têm landing custom — usa dados de `MODULES` para gerar uma landing decente automaticamente.
5. **Detecção de subdomínio** (helper + reescrita no `__root.tsx`) para que `devolucoes.hubnexus.com` renderize a landing certa em produção.
6. **Cross-sell no workspace** — banner em `/app` para quem entrou via 1 programa, e botão "Ver landing pública" em `/app/catalogo`.
7. **Documentação curta** explicando como adicionar nova landing custom (você só duplica o arquivo de Devoluções).

## Resumo do contrato de identidade (a regra de ouro)

> Existe **uma única conta Hub Nexus por email**. Toda landing de programa empurra o cadastro/login para `hubnexus.com`. Comprar/ativar um programa nunca cria conta paralela — apenas adiciona o módulo ao tenant existente (criando o tenant se for o primeiro acesso).

Pode aprovar que eu começo pelos passos 1, 2 e 3 (que já dão valor visível). Os passos 4–7 entram em sequência.
