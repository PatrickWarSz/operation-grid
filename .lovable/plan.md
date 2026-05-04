# Brief para o novo projeto Vexo Hub

Cole o texto abaixo como **primeira mensagem** do novo projeto Lovable. Ele dá ao agente o contexto completo do que é o Hub, o que NÃO fazer agora (landing, backend, billing) e libera criatividade visual dentro de guardrails claros.

---

## O que copiar para o novo projeto

> # Projeto: Vexo Hub (workspace)
>
> ## Contexto da empresa
> - **Empresa:** Vexo — Software & Solutions
> - **Marca:** `> V E X O <` — os `>` `<` são alusão a código/programação. Pense em algo como um cursor de código piscando, prompt esperando input, tags. **Ainda não tenho logo definida** — quero que você proponha 2–3 direções de marca/wordmark dentro deste conceito (cursor piscante, prompt `>_`, tag `<vexo/>`, etc.) usando só CSS/SVG inline. Sem mascote, sem estética hacker/gamer, sem retrô anos 2000.
> - **Domínios (futuros, não precisa configurar agora):**
>   - `vexodev.com.br` — site institucional
>   - `hub.vexodev.com.br` — este projeto
>   - `estoque.vexodev.com.br` / `devolucoes.vexodev.com.br` — programas satélites
> - **Instagram:** `@vexo.sys`
> - Tudo é **"by Vexo"**.
>
> ## O que é o Hub
> O Hub é o **workspace central da empresa cliente**. É a área logada onde o empresário entra e sente que tem um ambiente de trabalho profissional e exclusivo da marca dele, com acesso aos programas que comprou da Vexo.
>
> Conceitualmente o Hub tem duas camadas (mas **só a segunda importa agora**):
> 1. Landing pública + checkout — **NÃO FAZER AGORA**, vou repensar depois.
> 2. **Workspace logado (`/app`)** — É AQUI que vamos trabalhar.
>
> Os programas vendidos hoje são **dois satélites independentes** (projetos separados, não fazem parte deste repo):
> - **Estoque Pro** — controle de estoque e pedidos de matéria-prima.
> - **Devoluções Pro** — gestão de devoluções/disputas.
>
> No Hub eles aparecem como cards/tiles. Clicar abre o satélite em nova guia (handoff de sessão será implementado depois). Por enquanto: mocks visuais e botão "Abrir" desabilitado/placeholder.
>
> ## Escopo desta primeira fase
> **Somente front-end. Sem backend, sem auth real, sem billing, sem Lovable Cloud.** Use mocks em memória / localStorage. Quando eu pedir, ligamos Supabase depois.
>
> NÃO construa agora:
> - Landing page pública
> - Tela de login/signup funcionais (pode existir uma tela visual, mas sem auth real — qualquer email entra)
> - Painel de administrador (visão dono/Vexo)
> - Integração real com satélites
> - Pagamento
>
> ## Estrutura do workspace (`/app`)
>
> Layout: sidebar fixa à esquerda + topbar + área de conteúdo. Responsivo (sidebar vira drawer no mobile).
>
> **Sidebar (navegação):**
> - Logo `> V E X O <` no topo (com seu conceito visual)
> - Nome do workspace do cliente (ex.: "Acme Ltda") + filial atual (switcher)
> - Itens: Início · Meus Programas · Catálogo · Novidades · Configurações
> - Rodapé: usuário + sair
>
> **Topbar:**
> - Saudação contextual ("Boa tarde, Patrick")
> - Switcher de filial
> - Sino de notificações (mock)
> - Toggle tema (claro/escuro)
> - Avatar
>
> **Páginas:**
>
> 1. **`/app` — Início (dashboard)**
>    - Hero curto e profissional: nome da empresa do cliente + métrica resumo (ex.: "2 programas ativos · 1 em trial · 5 dias restantes")
>    - Grid dos programas contratados (cards grandes com mock de preview da tela do programa, status, botão "Abrir")
>    - Seção "Disponíveis para você" (programas não contratados, com CTA "Iniciar trial 14 dias")
>    - Seção "Novidades" (últimos 3 anúncios)
>    - Sem widgets vazios / placeholders genéricos. Se não há dado, mostrar empty state bonito e útil.
>
> 2. **`/app/programas`** — lista completa dos programas do cliente, filtrável por status (ativo/trial/bloqueado).
>
> 3. **`/app/programas/$slug`** — detalhe de um programa: descrição, features, screenshots/mock, status do trial, botão "Abrir programa" (nova aba), link para suporte/docs.
>
> 4. **`/app/catalogo`** — vitrine de TODOS os programas Vexo (incluindo "em breve"). Cada card mostra preço, features, e CTA "Iniciar trial" ou "Em breve".
>
> 5. **`/app/novidades`** — feed de releases/changelog/betas (mock). Categorias: feature, fix, beta, exclusivo, anúncio.
>
> 6. **`/app/configuracoes`** — abas:
>    - **Perfil:** nome, foto
>    - **Empresa:** razão social, segmento, tamanho
>    - **Filiais:** lista, criar/editar (mock)
>    - **Usuários:** lista, convidar (mock, sem envio real)
>    - **Aparência:** logo do cliente (upload mock), cor primária, modo claro/escuro do workspace
>    - **Faturamento:** mock — só visual, mostrando plano atual e próximo vencimento
>
> ## Modelo conceitual (para você entender, não precisa criar tabelas agora)
> - **Tenant** = empresa cliente (1 conta = 1 tenant)
> - **Unit** = filial (1 tenant tem N filiais; toda operação acontece no contexto de uma filial ativa)
> - **User** pertence a um tenant e tem acesso a uma ou mais filiais
> - **Module** = programa (estoque, devolucoes, ...)
> - **TenantModuleAccess** = qual programa o tenant tem (status: active/trial/blocked, validade do trial)
> - **Roles** ficarão em tabela separada quando o backend entrar (nunca no perfil)
>
> Hoje tudo isso vive em mocks/localStorage. Estruture o código de forma que trocar mock por chamadas reais depois seja só mexer no hook (`useWorkspace`, `useUnits`, etc.).
>
> ## Direção visual (liberdade criativa, com guardrails)
>
> **Vibe:** moderno, profissional, sensação de "ferramenta cara e bem feita". Referências mentais: Linear, Vercel dashboard, Raycast, Notion calendar, Stripe dashboard. Nada de:
> - estética hacker/gamer (sem terminal verde neon, sem matrix, sem glitch)
> - skeumorfismo/retrô anos 2000 (sem gradientes pesados, sem bordas em relevo)
> - "AI startup genérica" com glow roxo em tudo
>
> **Liberdade total para escolher:**
> - paleta (sugiro algo sóbrio com 1 cor de marca forte; pode propor)
> - tipografia (sans moderna; mono apenas em detalhes da marca, ex. logo `> V E X O <`)
> - densidade, raio de borda, sombras, microanimações
> - tema claro E escuro, ambos polidos (não só dark)
>
> **Exigências fixas:**
> - Logo/wordmark da Vexo deve incorporar `>` `<` de alguma forma criativa (proponha 2–3 variações, escolho uma)
> - Microanimação no logo: cursor/caret piscando ou efeito de "digitando" sutil — não pode ser chamativo demais
> - Acessibilidade: contraste AA, foco visível, respeitar `prefers-reduced-motion`
> - Cliente pode customizar cor primária e logo do próprio workspace (white-label leve) — o branding Vexo aparece discretamente como "by Vexo" no rodapé da sidebar
>
> ## Stack
> TanStack Start + Tailwind (já vem configurado). Use shadcn/ui para componentes base. Roteamento file-based em `src/routes/`. Sem react-router-dom.
>
> ## Primeira entrega que eu quero ver
> 1. Shell do workspace (sidebar + topbar + tema claro/escuro) com 2–3 propostas de logo/wordmark Vexo lado a lado numa tela de "escolher identidade" inicial (só pra eu decidir).
> 2. Página `/app` (Início) completa com mocks dos 2 programas (Estoque Pro e Devoluções Pro), 1 ativo + 1 em trial.
> 3. Página `/app/catalogo` com os 2 programas + 1 placeholder "em breve".
> 4. Estrutura de rotas pronta (mesmo que páginas internas estejam vazias com empty state).
> 5. Switcher de filial funcional (mock, troca o nome no topo).
>
> Não precisa: landing, login funcional, backend, billing, admin.

---

## Próximas mensagens sugeridas (depois desta)

1. "Escolhi a logo X. Agora detalhe a página `/app/programas/$slug` do Estoque Pro com mock de screenshots."
2. "Adicione handoff de sessão Hub → satélite (whitelist de hosts, fragment com token)."
3. "Ligue o Supabase: tabelas tenants/units/user_units/user_roles/tenant_module_access com RLS."
4. "Agora a landing pública em `/`."

Posso ajustar o brief antes de você usar — por exemplo, mudar referências visuais, tirar/colocar páginas, ou reforçar algum requisito. Quer que eu altere algo?
