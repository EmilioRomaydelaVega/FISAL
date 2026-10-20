/** Ids generados en el cliente, con el mismo formato que la versión original. */
export const createId = {
  inspection: (): number => Date.now(),
  machine: (): number => Date.now() + Math.floor(Math.random() * 1000),
  client: (): string => `c${Date.now()}`,
  rental: (): string => `rental-${Date.now()}`,
  photo: (): number => Date.now() + Math.random(),
  damage: (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dailyCheck: (machineId: string, date: string): string => `${machineId}_${date}`,
  accessCode: (): string => `FISAL-${Math.floor(1000 + Math.random() * 9000)}`,
};
