import type { WorkWeek } from "@/Core/Models/ProdGantt/WorkWeek";

export class WorkWeekCache {
  private static readonly STORAGE_KEY = "nrg-frontline-work-week";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-work-week-ts";

  static save(week: WorkWeek): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(week));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log("[WorkWeekCache] Cached work week");
    } catch (error) {
      console.error("[WorkWeekCache] Failed to save work week:", error);
    }
  }

  static load(): WorkWeek | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as WorkWeek;
    } catch (error) {
      console.error("[WorkWeekCache] Failed to load work week:", error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
    } catch (error) {
      console.error("[WorkWeekCache] Failed to clear cache:", error);
    }
  }
}
