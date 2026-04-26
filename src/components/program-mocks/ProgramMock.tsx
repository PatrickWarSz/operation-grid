/**
 * Mocks visuais por programa.
 * Cada slug tem um layout próprio que parece a tela inicial do programa.
 * Quando você publicar a versão real, troque o conteúdo de cada bloco
 * (ou substitua /apps/$slug por uma rota/aplicação real).
 */
import type { ReactNode } from "react";

interface Props {
  slug: string;
  variant: "preview" | "full";
}

export function ProgramMock({ slug, variant }: Props) {
  const padding = variant === "full" ? "32px" : "16px";
  const titleSize = variant === "full" ? "22px" : "14px";

  switch (slug) {
    case "devolucoes":
      return (
        <Frame padding={padding} title="Controle de Devoluções" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Abertas", value: "23", tone: "amber" },
              { label: "No prazo", value: "18", tone: "emerald" },
              { label: "Vencidas", value: "5", tone: "rose" },
              { label: "Resolvidas", value: "147", tone: "sky" },
            ]}
          />
          <Panel title="Disputas recentes">
            <Row cols={["#5821", "ML — Camiseta P", "Em análise", "2d"]} />
            <Row cols={["#5820", "Shopee — Tênis", "Aguardando", "5d"]} />
            <Row cols={["#5819", "Site — Boné", "Resolvida", "ok"]} />
            <Row cols={["#5818", "ML — Mochila", "Vencida", "−1d"]} tone="rose" />
          </Panel>
        </Frame>
      );

    case "estoque":
      return (
        <Frame padding={padding} title="Gestão de Estoque & Pedidos" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "SKUs", value: "1.284", tone: "sky" },
              { label: "Mín. atingido", value: "12", tone: "amber" },
              { label: "Em pedido", value: "8", tone: "emerald" },
              { label: "Giro/30d", value: "2.4x", tone: "indigo" },
            ]}
          />
          <Panel title="Estoque crítico">
            <Row cols={["MP-0021 Tecido azul", "12 un", "mín 50", "repor"]} tone="amber" />
            <Row cols={["MP-0034 Linha branca", "3 un", "mín 20", "urgente"]} tone="rose" />
            <Row cols={["PA-1102 Camisa M", "47 un", "mín 30", "ok"]} tone="emerald" />
          </Panel>
        </Frame>
      );

    case "financeiro-empresa":
      return (
        <Frame padding={padding} title="Gestão Financeira Empresarial" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Saldo", value: "R$ 84.2k", tone: "emerald" },
              { label: "A receber", value: "R$ 32.7k", tone: "sky" },
              { label: "A pagar", value: "R$ 18.4k", tone: "amber" },
              { label: "Margem", value: "31%", tone: "indigo" },
            ]}
          />
          <BarChart values={[42, 58, 51, 67, 73, 65, 82, 79]} />
        </Frame>
      );

    case "financeiro-pessoal":
      return (
        <Frame padding={padding} title="Controle Financeiro Pessoal" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Saldo", value: "R$ 12.4k", tone: "emerald" },
              { label: "Gastos/mês", value: "R$ 4.1k", tone: "amber" },
              { label: "Investido", value: "R$ 38k", tone: "sky" },
              { label: "Meta", value: "78%", tone: "indigo" },
            ]}
          />
          <Panel title="Categorias">
            <Row cols={["Alimentação", "R$ 1.240", "31%", "↑"]} />
            <Row cols={["Transporte", "R$ 680", "17%", "→"]} />
            <Row cols={["Lazer", "R$ 420", "10%", "↓"]} tone="emerald" />
          </Panel>
        </Frame>
      );

    case "vendas":
      return (
        <Frame padding={padding} title="Vendas & PDV" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Vendas hoje", value: "R$ 4.2k", tone: "emerald" },
              { label: "Pedidos", value: "38", tone: "sky" },
              { label: "Ticket médio", value: "R$ 110", tone: "indigo" },
              { label: "Conversão", value: "4.3%", tone: "amber" },
            ]}
          />
          <Funnel />
        </Frame>
      );

    case "crm":
      return (
        <Frame padding={padding} title="CRM & Atendimento" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Leads", value: "248", tone: "sky" },
              { label: "Em negociação", value: "42", tone: "amber" },
              { label: "Fechados", value: "18", tone: "emerald" },
              { label: "Taxa", value: "7.2%", tone: "indigo" },
            ]}
          />
          <Panel title="Pipeline">
            <Row cols={["Acme Indústria", "R$ 24k", "Proposta", "→"]} />
            <Row cols={["Beta Comércio", "R$ 12k", "Contato", "→"]} />
            <Row cols={["Gama Ltda", "R$ 38k", "Negociação", "↑"]} tone="emerald" />
          </Panel>
        </Frame>
      );

    case "bi":
      return (
        <Frame padding={padding} title="Relatórios & BI" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Receita", value: "R$ 142k", tone: "emerald" },
              { label: "Crescimento", value: "+18%", tone: "sky" },
              { label: "Custos", value: "R$ 87k", tone: "amber" },
              { label: "Lucro", value: "R$ 55k", tone: "indigo" },
            ]}
          />
          <BarChart values={[30, 45, 38, 62, 55, 71, 68, 84, 79, 92]} />
        </Frame>
      );

    case "fiscal":
      return (
        <Frame padding={padding} title="Notas Fiscais" titleSize={titleSize}>
          <KpiRow
            items={[
              { label: "Emitidas/mês", value: "412", tone: "sky" },
              { label: "Autorizadas", value: "408", tone: "emerald" },
              { label: "Rejeitadas", value: "4", tone: "rose" },
              { label: "ICMS", value: "R$ 18k", tone: "indigo" },
            ]}
          />
          <Panel title="Últimas emissões">
            <Row cols={["NF-e 04821", "R$ 2.480", "Autorizada", "ok"]} tone="emerald" />
            <Row cols={["NF-e 04820", "R$ 890", "Autorizada", "ok"]} tone="emerald" />
            <Row cols={["NF-e 04819", "R$ 1.240", "Rejeitada", "erro"]} tone="rose" />
          </Panel>
        </Frame>
      );

    default:
      return (
        <Frame padding={padding} title={slug} titleSize={titleSize}>
          <p style={{ color: "#71717a", fontSize: 13 }}>Tela inicial em desenvolvimento.</p>
        </Frame>
      );
  }
}

const tones: Record<string, { bg: string; text: string }> = {
  emerald: { bg: "#d1fae5", text: "#047857" },
  amber: { bg: "#fef3c7", text: "#b45309" },
  rose: { bg: "#ffe4e6", text: "#be123c" },
  sky: { bg: "#e0f2fe", text: "#0369a1" },
  indigo: { bg: "#e0e7ff", text: "#4338ca" },
};

function Frame({
  padding,
  title,
  titleSize,
  children,
}: {
  padding: string;
  title: string;
  titleSize: string;
  children: ReactNode;
}) {
  return (
    <div style={{ padding }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: titleSize, fontWeight: 600, color: "#18181b" }}>{title}</h1>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ height: 8, width: 8, borderRadius: 999, background: "#22c55e" }} />
          <span style={{ fontSize: 11, color: "#71717a" }}>ao vivo</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function KpiRow({ items }: { items: { label: string; value: string; tone: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            background: "white",
            border: "1px solid #e4e4e7",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>
            {it.label}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600, color: tones[it.tone]?.text ?? "#18181b" }}>
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f4f4f5", fontSize: 12, fontWeight: 600, color: "#52525b" }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ cols, tone }: { cols: string[]; tone?: string }) {
  const t = tone ? tones[tone] : null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `1.4fr 1fr 1fr 60px`,
        padding: "10px 14px",
        borderTop: "1px solid #f4f4f5",
        alignItems: "center",
        fontSize: 12,
        color: "#3f3f46",
      }}
    >
      {cols.map((c, i) => (
        <span
          key={i}
          style={
            i === cols.length - 1 && t
              ? {
                  justifySelf: "end",
                  background: t.bg,
                  color: t.text,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                }
              : i === cols.length - 1
              ? { justifySelf: "end", color: "#71717a", fontSize: 11 }
              : {}
          }
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, padding: 16 }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "#52525b" }}>Últimos períodos</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(v / max) * 100}%`,
              background: "linear-gradient(180deg, #0ea5e9, #0369a1)",
              borderRadius: 4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Funnel() {
  const stages = [
    { label: "Visitas", value: 4820, w: 100 },
    { label: "Carrinho", value: 1240, w: 70 },
    { label: "Checkout", value: 480, w: 45 },
    { label: "Pago", value: 207, w: 28 },
  ];
  return (
    <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, padding: 16 }}>
      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "#52525b" }}>Funil de conversão</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#71717a", width: 70 }}>{s.label}</span>
            <div
              style={{
                height: 22,
                width: `${s.w}%`,
                background: "linear-gradient(90deg, #6366f1, #0ea5e9)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                color: "white",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {s.value.toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
