import { Camera, CheckCircle2 } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { InspectionFormAction, InspectionFormState } from "@/hooks/backoffice/inspection-form";
import { plural } from "@/lib/text";

import { PhotoCapture } from "./PhotoCapture";

interface PhotosStepProps {
  form: InspectionFormState;
  dispatch: (action: InspectionFormAction) => void;
}

export function PhotosStep({ form, dispatch }: PhotosStepProps) {
  const count = form.photos.length;
  return (
    <section>
      <SectionHeading description="Añade fotos del estado actual de la máquina. Puedes usar la cámara del dispositivo.">
        Registro fotográfico
      </SectionHeading>
      <PhotoCapture
        photos={form.photos}
        onAdd={(photo) => {
          dispatch({ type: "addPhoto", photo });
        }}
        onRemove={(id) => {
          dispatch({ type: "removePhoto", id });
        }}
      />
      <div className="mt-4">
        {count === 0 ? (
          <Alert tone="warning" icon={<Camera />}>
            Se recomienda añadir al menos 4 fotos (frontal, trasera y laterales)
          </Alert>
        ) : (
          <Alert tone="brand" icon={<CheckCircle2 />}>
            {count} {plural(count, "foto")} {plural(count, "registrada")}
          </Alert>
        )}
      </div>
    </section>
  );
}
