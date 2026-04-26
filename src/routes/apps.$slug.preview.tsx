import { createFileRoute, notFound } from "@tanstack/react-router";
import { MODULES } from "@/lib/modules";
import { ProgramMock } from "@/components/program-mocks/ProgramMock";

export const Route = createFileRoute("/apps/$slug/preview")({
  loader: ({ params }) => {
    const m = MODULES.find((x) => x.id === params.slug);
    if (!m) throw notFound();
    return { module: m };
  },
  component: AppPreview,
});

function AppPreview() {
  const { module: m } = Route.useLoaderData();
  return (
    <div style={{ background: "#fafafa", minHeight: "100%", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <ProgramMock slug={m.id} variant="preview" />
    </div>
  );
}
