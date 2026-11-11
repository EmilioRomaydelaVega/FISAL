import { FlaskConical, MessageSquareText, RotateCcw, Search } from "lucide-react";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { Buscador } from "./components/Buscador";
import { Chat } from "./components/Chat";
import { enviarPregunta, MODO_DEMO } from "./lib/api";
import { MANUALES } from "./lib/busqueda";
import type { ImagenAdjunta, Mensaje, PaginaAbierta } from "./types";

// El visor de PDF pesa bastante: solo se descarga la primera vez que se abre un manual.
const VisorPdf = lazy(() => import("./components/VisorPdf"));

type Pestana = "chat" | "buscador";

const MAQUINAS = [...new Set(MANUALES.map((m) => m.maquina))];

export default function App() {
  const [pestana, setPestana] = useState<Pestana>("chat");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [visor, setVisor] = useState<PaginaAbierta | null>(null);
  const [maquina, setMaquina] = useState("");
  const [consulta, setConsulta] = useState("");

  async function enviar(texto: string, imagenes: ImagenAdjunta[]) {
    const pregunta: Mensaje = {
      id: crypto.randomUUID(),
      rol: "usuario",
      texto,
      imagenes,
      fecha: new Date().toISOString(),
    };
    const historial = [...mensajes, pregunta];
    setMensajes(historial);
    setOcupado(true);
    try {
      const r = await enviarPregunta({ pregunta: texto, imagenes, maquina: maquina || undefined, historial: mensajes });
      setMensajes((prev) => [
        ...prev,
        { id: crypto.randomUUID(), rol: "asistente", fecha: new Date().toISOString(), ...r },
      ]);
    } catch (e) {
      setMensajes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          fecha: new Date().toISOString(),
          respuesta: "No he podido responder ahora mismo. Vuelve a intentarlo en un momento.",
          detalle: [e instanceof Error ? e.message : "Error desconocido"],
          fuentes: [],
        },
      ]);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="relative bg-[#1c1c1c] text-white">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <img
            src={`${import.meta.env.BASE_URL}marca/logo-grupo-fisal-blanco.png`}
            alt="Grupo Fisal"
            className="h-8 w-auto shrink-0 sm:h-9"
          />
          <div className="min-w-0 flex-1 border-l border-white/15 pl-3">
            <h1 className="truncate font-display text-[15px] leading-tight font-bold tracking-wide">
              IA <span className="text-gold">FISAL</span>
            </h1>
            <p className="truncate text-xs text-white/60">Asistente técnico de taller</p>
          </div>

          <label className="hidden items-center gap-2 text-xs text-white/80 sm:flex">
            Máquina
            <select
              value={maquina}
              onChange={(e) => setMaquina(e.target.value)}
              className="h-9 rounded-lg border border-white/20 bg-white/10 px-2 text-sm text-white outline-none [&>option]:text-ink"
            >
              <option value="">Todas</option>
              {MAQUINAS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>

          {mensajes.length > 0 && pestana === "chat" && (
            <button
              type="button"
              onClick={() => {
                setMensajes([]);
                setVisor(null);
              }}
              className="grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Nueva conversación"
              title="Nueva conversación"
            >
              <RotateCcw className="size-4.5" aria-hidden />
            </button>
          )}
        </div>
        <div className="h-[3px] bg-gold" />
      </header>

      {MODO_DEMO && (
        <p className="flex items-center justify-center gap-1.5 bg-gold-soft px-3 py-1.5 text-center text-xs font-medium text-gold-ink">
          <FlaskConical className="size-3.5 shrink-0" aria-hidden />
          Modo demostración: manuales y respuestas de prueba, sin IA conectada todavía.
        </p>
      )}

      <nav className="flex items-center gap-0.5 border-b border-border bg-surface px-2 sm:gap-1 sm:px-4" aria-label="Secciones">
        <BotonPestana activa={pestana === "chat"} onClick={() => setPestana("chat")} icono={<MessageSquareText className="size-4" aria-hidden />}>
          Asistente
        </BotonPestana>
        <BotonPestana activa={pestana === "buscador"} onClick={() => setPestana("buscador")} icono={<Search className="size-4" aria-hidden />}>
          Buscador
        </BotonPestana>
        <label className="ml-auto flex min-w-0 items-center sm:hidden">
          <span className="sr-only">Máquina</span>
          <select
            value={maquina}
            onChange={(e) => setMaquina(e.target.value)}
            className="h-8 w-36 min-w-0 rounded-lg border border-border bg-surface px-1.5 text-xs text-ink-soft"
          >
            <option value="">Todas las máquinas</option>
            {MAQUINAS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </nav>

      <main className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {pestana === "chat" ? (
            <Chat mensajes={mensajes} ocupado={ocupado} visor={visor} onEnviar={enviar} onAbrir={setVisor} />
          ) : (
            <Buscador consulta={consulta} onConsulta={setConsulta} maquina={maquina} visor={visor} onAbrir={setVisor} />
          )}
        </section>

        {visor && (
          <Suspense fallback={null}>
            <VisorPdf abierta={visor} onCambiar={setVisor} onCerrar={() => setVisor(null)} />
          </Suspense>
        )}
      </main>
    </div>
  );
}

function BotonPestana({
  activa,
  onClick,
  icono,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  icono: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa ? "page" : undefined}
      className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 sm:px-3 text-sm font-semibold transition ${
        activa ? "border-gold text-ink" : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {icono}
      {children}
    </button>
  );
}
