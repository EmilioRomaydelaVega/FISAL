import { createFileRoute } from "@tanstack/react-router";
import InspectionApp from "@/components/InspectionApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CheckIn Pro — Inspección de Maquinaria" },
      { name: "description", content: "Registra inspecciones de salida y entrada de maquinaria con checklist, fotos y mapa de desperfectos." },
      { property: "og:title", content: "CheckIn Pro — Inspección de Maquinaria" },
      { property: "og:description", content: "Registra inspecciones de salida y entrada de maquinaria con checklist, fotos y mapa de desperfectos." },
    ],
  }),
  component: InspectionApp,
});
