import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import { useDocumentTitle, type PageMeta } from "@/hooks/useDocumentTitle";
import { BackofficePage } from "@/pages/backoffice/BackofficePage";
import { ErrorPage } from "@/pages/ErrorPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ClientLoginPage } from "@/pages/portal/ClientLoginPage";
import { ClientMachinesPage } from "@/pages/portal/ClientMachinesPage";
import { DailyCheckPage } from "@/pages/portal/DailyCheckPage";
import { clientSessionStore } from "@/services/client-session.service";

const PAGE_META = {
  backoffice: {
    title: "CheckIn Pro — Inspección de Maquinaria",
    description:
      "Registra inspecciones de salida y entrada de maquinaria con checklist, fotos y mapa de desperfectos.",
  },
  login: {
    title: "Portal de cliente — FISALRENT",
    description:
      "Accede con tu código de cliente y envía el parte diario de las máquinas Komatsu que tienes alquiladas.",
  },
  machines: {
    title: "Mis máquinas alquiladas — FISALRENT",
    description:
      "Consulta las máquinas que tienes alquiladas y comprueba si ya has enviado el parte diario de hoy.",
  },
  dailyCheck: {
    title: "Parte diario de máquina — FISALRENT",
    description:
      "Rellena el parte diario: checklist rápido, horómetro, fotos, incidencias y firma del operador.",
  },
} satisfies Record<string, PageMeta>;

/** Rutas del portal que exigen haber entrado con un código de cliente. */
function requireClientSession() {
  const session = clientSessionStore.get();
  if (!session) throw redirect({ to: "/cliente" });
  return { session };
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  ),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

const backofficeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function BackofficeRoute() {
    useDocumentTitle(PAGE_META.backoffice);
    return <BackofficePage />;
  },
});

const clientLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cliente",
  beforeLoad: () => {
    if (clientSessionStore.get()) throw redirect({ to: "/cliente/maquinas" });
  },
  component: function ClientLoginRoute() {
    useDocumentTitle(PAGE_META.login);
    return <ClientLoginPage />;
  },
});

const clientMachinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cliente/maquinas",
  beforeLoad: requireClientSession,
  component: function ClientMachinesRoute() {
    useDocumentTitle(PAGE_META.machines);
    const { session } = clientMachinesRoute.useRouteContext();
    return <ClientMachinesPage session={session} />;
  },
});

const dailyCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cliente/parte/$machineId",
  beforeLoad: requireClientSession,
  component: function DailyCheckRoute() {
    useDocumentTitle(PAGE_META.dailyCheck);
    const { session } = dailyCheckRoute.useRouteContext();
    const { machineId } = dailyCheckRoute.useParams();
    return <DailyCheckPage key={machineId} session={session} machineId={machineId} />;
  },
});

const routeTree = rootRoute.addChildren([
  backofficeRoute,
  clientLoginRoute,
  clientMachinesRoute,
  dailyCheckRoute,
]);

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
