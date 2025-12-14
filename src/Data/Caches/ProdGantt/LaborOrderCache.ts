// LaborOrderCache.ts
// Simple localStorage cache for labor order (array of string IDs)

const KEY = "ProdGantt.LaborOrder";

export const LaborOrderCache = {
  load(): string[] | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
        return arr;
      }
      return null;
    } catch {
      return null;
    }
  },
  save(order: string[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(order));
    } catch {}
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};
