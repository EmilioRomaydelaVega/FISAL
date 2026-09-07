import { createFileRoute } from "@tanstack/react-router";
import { ClientDailyCheck } from "@/components/ClientPortal.jsx";

export const Route = createFileRoute("/cliente/parte/$machineId")({
  head: () => ({
    meta: [
      { title: "Parte diario de máquina — FISALRENT" },
      { name: "description", content: "Rellena el parte diario: checklist rápido, horómetro, fotos, incidencias y firma del operador." },
      { property: "og:title", content: "Parte diario de máquina — FISALRENT" },
      { property: "og:description", content: "Checklist rápido, horómetro, fotos, incidencias y firma del operador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DailyCheckRoute,
});

function DailyCheckRoute() {
  const { machineId } = Route.useParams();
  return <ClientDailyCheck machineId={machineId} />;
}
