import type { OperationDto } from "@/Core/Models/nrg-dtos/Operation/OperationDto";

export class OperationsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-operations";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-operations-ts";

  static save(operations: OperationDto[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(operations));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(`[OperationsCache] Cached ${operations.length} operations`);
    } catch (error) {
      console.error(
        "[OperationsCache] Failed to save operations to cache:",
        error,
      );
    }
  }

  static load(): OperationDto[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const operations = JSON.parse(raw) as OperationDto[];
      return Array.isArray(operations) ? operations : null;
    } catch (error) {
      console.error(
        "[OperationsCache] Failed to load operations from cache:",
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
      console.error("[OperationsCache] Failed to clear cache:", error);
    }
  }
}
