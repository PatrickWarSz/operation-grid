import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/financeiro")({
  head: () => ({ meta: [{ title: "Admin — Financeiro" }] }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-sm text-zinc-400 mt-1">Histórico de pagamentos e cobranças.</p>
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
        <Wallet className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
        <h3 className="font-semibold">Aguardando integração Asaas</h3>
        <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          Quando a Etapa B estiver concluída, esta página mostrará todas as cobranças, pagamentos confirmados e inadimplentes.
        </p>
      </div>
    </div>
  );
}
