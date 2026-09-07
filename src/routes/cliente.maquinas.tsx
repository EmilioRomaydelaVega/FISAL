import { createFileRoute } from "@tanstack/react-router";
import { ClientMachines } from "@/components/ClientPortal.jsx";

export const Route = createFileRoute("/cliente/maquinas")({
  head: () => ({
    meta: [
      { title: "Mis máquinas alquiladas — FISALRENT" },
      { name: "description", content: "Consulta las máquinas que tienes alquiladas y comprueba si ya has enviado el parte diario de hoy." },
      { property: "og:title", content: "Mis máquinas alquiladas — FISALRENT" },
      { property: "og:description", content: "Consulta tus máquinas alquiladas y el estado del parte diario de hoy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientMachines,
});
