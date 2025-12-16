export class SelectedProjectsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-selected-projects";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-selected-projects-ts";

  static save(projectNumbers: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectNumbers));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(
        `[SelectedProjectsCache] Cached ${projectNumbers.length} selected project numbers`,
      );
    } catch (error) {
      console.error(
        "[SelectedProjectsCache] Failed to save selected projects to cache:",
        error,
      );
    }
  }

  static load(): string[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const projectNumbers = JSON.parse(raw) as string[];
      return Array.isArray(projectNumbers) ? projectNumbers : null;
    } catch (error) {
      console.error(
        "[SelectedProjectsCache] Failed to load selected project numbers from cache:",
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
      console.log("[SelectedProjectsCache] Cache cleared");
    } catch (error) {
      console.error("[SelectedProjectsCache] Failed to clear cache:", error);
    }
  }
}
