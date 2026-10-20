/**
 * Borrador de la inspección en curso guardado en IndexedDB (admite fotos
 * grandes). Mantiene la base de datos y la clave de la versión original.
 */
const DB_NAME = "fisalrent-draft";
const STORE = "draft";
const KEY = "current";

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () => {
      reject(request.error ?? new Error("No se pudo abrir el borrador"));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function runRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | undefined> {
  const db = await openDatabase();
  if (!db) return undefined;
  return new Promise((resolve, reject) => {
    const request = operation(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => {
      resolve(request.result);
      db.close();
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Error en el borrador"));
      db.close();
    };
  });
}

export const inspectionDraftStore = {
  async load(): Promise<unknown> {
    return runRequest("readonly", (store) => store.get(KEY));
  },
  async save(draft: object): Promise<void> {
    await runRequest("readwrite", (store) => store.put(draft, KEY));
  },
  async clear(): Promise<void> {
    await runRequest("readwrite", (store) => store.delete(KEY));
  },
};
