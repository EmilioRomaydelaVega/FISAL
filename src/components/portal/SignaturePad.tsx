import { Eraser } from "lucide-react";
import { useRef, type PointerEvent } from "react";

import { Button } from "@/components/ui/Button";

const WIDTH = 600;
const HEIGHT = 180;
const INK_COLOR = "#111827";

interface SignaturePadProps {
  onChange: (signature: string | null) => void;
}

/** Lienzo para firmar con ratón, dedo o lápiz. Devuelve la firma como PNG. */
export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const pointFrom = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = pointFrom(event);
    context.strokeStyle = INK_COLOR;
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(x, y);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    event.preventDefault();
    const { x, y } = pointFrom(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const end = () => {
    if (!drawing.current || !canvasRef.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label="Zona de firma"
        role="img"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        className="h-40 w-full touch-none rounded-md border-2 border-dashed border-border-strong bg-surface-muted/50"
      />
      <Button variant="ghost" size="sm" className="mt-2" onClick={clear}>
        <Eraser aria-hidden="true" />
        Borrar firma
      </Button>
    </div>
  );
}
