"""Genera los manuales de DEMOSTRACIÓN del chatbot y su índice de texto.

Los manuales son inventados (máquinas y valores ficticios) y solo sirven para
probar la interfaz mientras llegan los manuales reales de taller. Cuando estén,
este script y los archivos que crea se borran.

Crea:
  public/manuales/demo-excavadora-ex20.pdf
  public/manuales/demo-cargadora-ce5.pdf
  src/data/indice-demo.json   (texto de cada página, para el buscador)

Uso: python3 scripts/generar_manuales_demo.py   (necesita reportlab)
"""

import json
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

RAIZ = Path(__file__).resolve().parent.parent

MANUALES = [
    {
        "id": "demo-excavadora-ex20",
        "titulo": "Manual de taller · Excavadora EX-20 (demo)",
        "maquina": "Excavadora EX-20",
        "paginas": [
            (
                "Portada",
                [
                    "Manual de taller de la excavadora de demostración EX-20.",
                    "Este documento es ficticio y solo sirve para probar el asistente técnico de Grupo Fisal.",
                    "Contenido: seguridad, mantenimiento periódico, sistema hidráulico, códigos de error y engrase.",
                ],
            ),
            (
                "1. Seguridad",
                [
                    "Antes de cualquier intervención, apoye el equipo de trabajo en el suelo, pare el motor y retire la llave.",
                    "Libere la presión residual del circuito hidráulico moviendo las palancas de mando con el motor parado.",
                    "Use gafas, guantes y calzado de seguridad. Nunca busque fugas hidráulicas con la mano: el aceite a presión puede penetrar en la piel.",
                    "Coloque la etiqueta de NO ARRANCAR en la cabina mientras dure el trabajo.",
                ],
            ),
            (
                "2. Mantenimiento periódico",
                [
                    "Cada 250 horas: cambiar aceite del motor (15 litros, SAE 10W-40) y filtro de aceite del motor, referencia demo FA-2010.",
                    "Cada 500 horas: cambiar filtro de combustible FC-2020 y prefiltro separador de agua FS-2021, y revisar el filtro de aire.",
                    "Cada 1000 horas: cambiar filtro de retorno hidráulico FH-2030 y aceite de la transmisión de giro.",
                    "Cada 2000 horas: cambiar el aceite hidráulico (120 litros, ISO VG 46) y limpiar el filtro de aspiración.",
                    "Tiempo estimado de taller para la revisión de 500 horas: 2,5 horas de mecánico.",
                ],
            ),
            (
                "3. Sistema hidráulico",
                [
                    "Presión de trabajo nominal de la bomba principal: 320 bar. Presión de pilotaje: 35 bar.",
                    "Para medir la presión, conecte el manómetro en la toma de prueba MP1 situada junto a la bomba principal.",
                    "Si la presión es inferior a 290 bar, revise el filtro de retorno, el nivel de aceite y la válvula de alivio principal.",
                    "Fugas en latiguillos: sustituya el latiguillo completo, no repare con abrazaderas. Par de apriete de racores de 1/2 pulgada: 60 Nm.",
                ],
            ),
            (
                "4. Códigos de error",
                [
                    "E-101 Temperatura de refrigerante alta: compruebe nivel de refrigerante, limpieza del radiador y correa del ventilador.",
                    "E-203 Presión hidráulica baja: compruebe nivel de aceite hidráulico, filtro de retorno FH-2030 y presión en la toma MP1.",
                    "E-305 Fallo del sensor de régimen del motor: revise el conector del sensor y el cableado hasta la centralita.",
                    "E-410 Tensión de batería baja: compruebe batería, alternador y bornes. Tensión correcta con motor en marcha: 27 a 28,5 voltios.",
                ],
            ),
            (
                "5. Engrase",
                [
                    "Engrase cada 10 horas o diariamente los bulones de pluma, balancín y cazo con grasa de litio EP2.",
                    "Engrase cada 50 horas la corona de giro: 10 bombeos repartidos girando la superestructura 90 grados entre cada uno.",
                    "En trabajos con agua o barro, reduzca los intervalos de engrase a la mitad.",
                ],
            ),
        ],
    },
    {
        "id": "demo-cargadora-ce5",
        "titulo": "Manual de taller · Cargadora eléctrica CE-5 (demo)",
        "maquina": "Cargadora eléctrica CE-5",
        "paginas": [
            (
                "Portada",
                [
                    "Manual de taller de la cargadora eléctrica de demostración CE-5.",
                    "Este documento es ficticio y solo sirve para probar el asistente técnico de Grupo Fisal.",
                    "Contenido: seguridad eléctrica, batería y carga, mantenimiento y códigos de error.",
                ],
            ),
            (
                "1. Seguridad eléctrica",
                [
                    "El sistema de tracción trabaja a 600 voltios. Solo personal con formación en alta tensión puede abrir los componentes marcados en naranja.",
                    "Antes de intervenir, accione el seccionador de batería, espere 5 minutos a que se descarguen los condensadores y compruebe ausencia de tensión.",
                    "Use guantes dieléctricos de clase 0 y herramienta aislada.",
                ],
            ),
            (
                "2. Batería y carga",
                [
                    "Capacidad de la batería: 280 kWh. Carga rápida en corriente continua hasta el 80 % en 1,5 horas; carga en alterna completa en 8 horas.",
                    "Mantenga la carga entre el 20 % y el 90 % para alargar la vida de la batería.",
                    "Si la máquina va a estar parada más de un mes, déjela al 50 % y desconecte el seccionador.",
                    "Temperatura de trabajo de la batería: entre -20 y 45 grados.",
                ],
            ),
            (
                "3. Mantenimiento periódico",
                [
                    "Cada 500 horas: revisar el refrigerante del circuito de batería y del motor eléctrico, y limpiar los radiadores.",
                    "Cada 1000 horas: cambiar el filtro de retorno hidráulico FH-5030 y el filtro de cabina FK-5040.",
                    "Cada 2000 horas: cambiar el aceite de los ejes y el aceite hidráulico (90 litros, ISO VG 46).",
                    "Tiempo estimado de taller para la revisión de 1000 horas: 3 horas de mecánico.",
                ],
            ),
            (
                "4. Códigos de error",
                [
                    "B-12 Temperatura de batería alta: pare la carga, compruebe el nivel de refrigerante de batería y el ventilador del radiador.",
                    "B-27 Desequilibrio entre celdas: realice una carga de equilibrado completa en alterna. Si persiste, avise al servicio técnico.",
                    "M-08 Sobretemperatura del motor de tracción: reduzca la carga de trabajo y revise el circuito de refrigeración.",
                    "H-03 Presión hidráulica baja: compruebe nivel de aceite hidráulico y el filtro de retorno FH-5030.",
                ],
            ),
        ],
    },
]

AZUL = HexColor("#1d4f91")
ORO = HexColor("#c9a227")
GRIS = HexColor("#5b6472")


def generar_pdf(manual: dict, destino: Path) -> None:
    ancho, alto = A4
    c = canvas.Canvas(str(destino), pagesize=A4)
    c.setTitle(manual["titulo"])
    total = len(manual["paginas"])
    for n, (titulo, parrafos) in enumerate(manual["paginas"], start=1):
        # Cabecera
        c.setFillColor(AZUL)
        c.rect(0, alto - 70, ancho, 70, stroke=0, fill=1)
        c.setFillColor(HexColor("#ffffff"))
        c.setFont("Helvetica-Bold", 13)
        c.drawString(40, alto - 42, manual["titulo"])
        c.setFillColor(ORO)
        c.rect(0, alto - 74, ancho, 4, stroke=0, fill=1)

        # Marca de agua
        c.saveState()
        c.setFillColor(HexColor("#f1d9d9"))
        c.setFont("Helvetica-Bold", 44)
        c.translate(ancho / 2, alto / 2 - 60)
        c.rotate(30)
        c.drawCentredString(0, 0, "DEMOSTRACIÓN")
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(0, -36, "Datos ficticios, no usar en taller")
        c.restoreState()

        # Título de la página
        c.setFillColor(AZUL)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(40, alto - 120, titulo)

        # Texto
        y = alto - 160
        c.setFillColor(HexColor("#111827"))
        for parrafo in parrafos:
            lineas = simpleSplit(parrafo, "Helvetica", 11.5, ancho - 80)
            c.setFont("Helvetica", 11.5)
            for linea in lineas:
                c.drawString(40, y, linea)
                y -= 16
            y -= 10

        # Pie
        c.setFillColor(GRIS)
        c.setFont("Helvetica", 9)
        c.drawString(40, 30, f"{manual['maquina']} · Grupo Fisal · documento de demostración")
        c.drawRightString(ancho - 40, 30, f"Página {n} de {total}")
        c.showPage()
    c.save()


def main() -> None:
    carpeta_pdf = RAIZ / "public" / "manuales"
    carpeta_pdf.mkdir(parents=True, exist_ok=True)
    indice = {"manuales": [], "paginas": []}
    for manual in MANUALES:
        archivo = f"{manual['id']}.pdf"
        generar_pdf(manual, carpeta_pdf / archivo)
        indice["manuales"].append(
            {
                "id": manual["id"],
                "titulo": manual["titulo"],
                "maquina": manual["maquina"],
                "url": f"manuales/{archivo}",
                "paginas": len(manual["paginas"]),
            }
        )
        for n, (titulo, parrafos) in enumerate(manual["paginas"], start=1):
            indice["paginas"].append(
                {"manualId": manual["id"], "pagina": n, "seccion": titulo, "texto": " ".join(parrafos)}
            )
    destino = RAIZ / "src" / "data" / "indice-demo.json"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(indice['manuales'])} manuales y {len(indice['paginas'])} páginas generadas")


if __name__ == "__main__":
    main()
