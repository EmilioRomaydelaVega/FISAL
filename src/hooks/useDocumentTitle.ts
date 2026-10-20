import { useEffect } from "react";

export interface PageMeta {
  title: string;
  description?: string;
}

/** Título y descripción de la página actual. */
export function useDocumentTitle({ title, description }: PageMeta): void {
  useEffect(() => {
    document.title = title;
    if (description === undefined) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = description;
  }, [title, description]);
}
