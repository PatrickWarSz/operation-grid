import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Como funciona a contratação por programa?",
    a: "Você seleciona apenas os programas que precisa. Cada programa tem um preço mensal fixo. Pode adicionar ou remover quando quiser, sem multa.",
  },
  {
    q: "Meus dados ficam isolados dos outros clientes?",
    a: "Sim. O Hub Nexus é multi-tenant com isolamento total no banco de dados via Row Level Security. Nenhum cliente acessa dados de outro.",
  },
  {
    q: "Consigo personalizar com a marca da minha empresa?",
    a: "Sim. White-label completo: seu logo, suas cores, sua identidade. Seus colaboradores enxergam o sistema como se fosse exclusivamente seu.",
  },
  {
    q: "E se eu precisar de uma funcionalidade específica?",
    a: "Suportamos feature flags por cliente. Funcionalidades específicas podem ser liberadas apenas para a sua conta, sem afetar outros usuários.",
  },
  {
    q: "Existe contrato ou fidelidade?",
    a: "Não. Cobrança mensal, cancelamento livre. Você só paga enquanto usar.",
  },
  {
    q: "Como funcionam as atualizações?",
    a: "Atualizações globais chegam para todos automaticamente. Atualizações específicas (sob demanda) são liberadas individualmente.",
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Sim. Você tem 14 dias de teste gratuito com acesso a todos os programas. Sem cartão de crédito. Após esse período, escolha quais programas manter ativos para continuar usando.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 border-t border-border/60">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Dúvidas frequentes</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Perguntas que sempre recebemos.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-primary/40 data-[state=open]:bg-card-elevated transition-colors"
            >
              <AccordionTrigger className="font-medium text-left hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
