import { createFileRoute } from "@tanstack/react-router";
import { ClientLogin } from "@/components/ClientPortal.jsx";

export const Route = createFileRoute("/cliente/")({
  head: () => ({
    meta: [
      { title: "Portal de cliente — FISALRENT" },
      { name: "description", content: "Accede con tu código de cliente y envía el parte diario de las máquinas Komatsu que tienes alquiladas." },
      { property: "og:title", content: "Portal de cliente — FISALRENT" },
      { property: "og:description", content: "Accede con tu código de cliente y envía el parte diario de tus máquinas alquiladas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientLogin,
});
