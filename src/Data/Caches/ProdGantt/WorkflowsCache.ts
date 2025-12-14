import type { WorkflowDto } from "@/Core/Models/nrg-dtos/WorkflowDto";

export class WorkflowsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-workflows";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-workflows-ts";

  static save(workflows: WorkflowDto[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(`[WorkflowsCache] Cached ${workflows.length} workflows`);
    } catch (error) {
      console.error(
        "[WorkflowsCache] Failed to save workflows to cache:",
        error,
      );
    }
  }

  static load(): WorkflowDto[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const workflows = JSON.parse(raw) as WorkflowDto[];
      return Array.isArray(workflows) ? workflows : null;
    } catch (error) {
      console.error(
        "[WorkflowsCache] Failed to load workflows from cache:",
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
      console.error("[WorkflowsCache] Failed to clear cache:", error);
    }
  }
}
