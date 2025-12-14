export class EnabledLaborsCache {
  private static readonly STORAGE_KEY = "nrg-frontline-enabled-labors";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-enabled-labors-ts";

  static save(enabledIds: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enabledIds));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(
        `[EnabledLaborsCache] Cached ${enabledIds.length} enabled labor IDs`,
      );
    } catch (error) {
      console.error(
        "[EnabledLaborsCache] Failed to save enabled labors:",
        error,
      );
    }
  }

  static load(): string[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const ids = JSON.parse(raw) as string[];
      return Array.isArray(ids) ? ids : null;
    } catch (error) {
      console.error(
        "[EnabledLaborsCache] Failed to load enabled labors:",
        error,
      );
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
    } catch (error) {
      console.error("[EnabledLaborsCache] Failed to clear cache:", error);
    }
  }
}
