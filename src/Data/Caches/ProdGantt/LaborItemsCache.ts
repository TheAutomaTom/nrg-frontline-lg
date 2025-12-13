import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";

export class LaborItemsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-labor-items";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-labor-items-ts";

  static save(items: LaborItemDto[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(`[LaborItemsCache] Cached ${items.length} labor items`);
    } catch (error) {
      console.error(
        "[LaborItemsCache] Failed to save labor items to cache:",
        error,
      );
    }
  }

  static load(): LaborItemDto[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const items = JSON.parse(raw) as LaborItemDto[];
      return Array.isArray(items) ? items : null;
    } catch (error) {
      console.error(
        "[LaborItemsCache] Failed to load labor items from cache:",
        error,
      );
      return null;
    }
  }

  static hasCache(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  static getCacheTimestamp(): Date | null {
    const ts = localStorage.getItem(this.TIMESTAMP_KEY);
    return ts ? new Date(ts) : null;
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
    } catch (error) {
      console.error("[LaborItemsCache] Failed to clear cache:", error);
    }
  }
}
