import type { WorkflowStep } from "@/Core/Models/ProdGantt/WorkflowStep";

export class WorkflowStepsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-workflow-steps";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-workflow-steps-ts";

  static save(workflowStepsMap: Record<string, WorkflowStep[]>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflowStepsMap));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(
        `[WorkflowStepsCache] Cached workflow steps for ${Object.keys(workflowStepsMap).length} workflows`,
      );
    } catch (error) {
      console.error(
        "[WorkflowStepsCache] Failed to save workflow steps to cache:",
        error,
      );
    }
  }

  static load(): Record<string, WorkflowStep[]> | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const workflowStepsMap = JSON.parse(raw) as Record<
        string,
        WorkflowStep[]
      >;
      return workflowStepsMap;
    } catch (error) {
      console.error(
        "[WorkflowStepsCache] Failed to load workflow steps from cache:",
        error,
      );
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      console.log("[WorkflowStepsCache] Cleared workflow steps cache");
    } catch (error) {
      console.error(
        "[WorkflowStepsCache] Failed to clear workflow steps cache:",
        error,
      );
    }
  }

  static getTimestamp(): Date | null {
    try {
      const ts = localStorage.getItem(this.TIMESTAMP_KEY);
      return ts ? new Date(ts) : null;
    } catch (error) {
      console.error(
        "[WorkflowStepsCache] Failed to get workflow steps cache timestamp:",
        error,
      );
      return null;
    }
  }
}
