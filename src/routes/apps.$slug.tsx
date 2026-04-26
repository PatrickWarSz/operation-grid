import { createFileRoute, notFound } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";
import { ProgramMock } from "@/components/program-mocks/ProgramMock";

export const Route = createFileRoute("/apps/$slug")({
  loader: ({ params }) => {
    const m = MODULES.find((x) => x.id === params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.module.name ?? "Programa"}` }],
  }),
  component: AppFull,
});

function AppFull() {
  const { module: m } = Route.useLoaderData();
  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <ProgramMock slug={m.id} variant="full" />
    </div>
  );
}
