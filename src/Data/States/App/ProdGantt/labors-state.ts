import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { LaborItemsCache } from "@/Data/Caches/ProdGantt/LaborItemsCache";
import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";

// Enhanced labor item with sequence and enabled state
export interface EnhancedLaborItem extends LaborItemDto {
  Sequence: number;
  IsEnabled: boolean;
}

// Cache keys for enhanced labor lists by type
const ENHANCED_DRAFTING_KEY = "nrg-frontline-enhanced-drafting";
const ENHANCED_PRODUCTION_KEY = "nrg-frontline-enhanced-production";
const ENHANCED_INSTALLATION_KEY = "nrg-frontline-enhanced-installation";

export const useLaborsAndOperationsState = defineStore(
  "LaborsAndOperationsState",
  () => {
    const app$ = useAppState();
    const config$ = useUserConfigState();
    const nrg = app$.NrgClient ?? new NrgClient();

    // Immutable list from API (cached separately)
    const ApiLaborItems = ref<LaborItemDto[] | null>(null);

    // Enhanced lists separated by WorkOrderType
    const DraftingLabors = ref<EnhancedLaborItem[]>([]);
    const ProductionLabors = ref<EnhancedLaborItem[]>([]);
    const InstallationLabors = ref<EnhancedLaborItem[]>([]);

    const IsLoadingLaborItems = ref(false);

    // Load immutable API data from cache
    const loadApiLaborsFromCache = (): boolean => {
      const cached = LaborItemsCache.load();
      if (cached) {
        ApiLaborItems.value = cached;
        return true;
      }
      return false;
    };

    // Load enhanced labor lists from cache
    const loadEnhancedLaborsFromCache = (): void => {
      try {
        const drafting = localStorage.getItem(ENHANCED_DRAFTING_KEY);
        const production = localStorage.getItem(ENHANCED_PRODUCTION_KEY);
        const installation = localStorage.getItem(ENHANCED_INSTALLATION_KEY);

        if (drafting)
          DraftingLabors.value = JSON.parse(drafting) as EnhancedLaborItem[];
        if (production)
          ProductionLabors.value = JSON.parse(
            production,
          ) as EnhancedLaborItem[];
        if (installation)
          InstallationLabors.value = JSON.parse(
            installation,
          ) as EnhancedLaborItem[];
      } catch (err) {
        console.warn(
          "[LaborsState] Failed to load enhanced labors from cache",
          err,
        );
      }
    };

    // Save enhanced labor lists to cache
    const saveEnhancedLaborsToCache = (): void => {
      try {
        localStorage.setItem(
          ENHANCED_DRAFTING_KEY,
          JSON.stringify(DraftingLabors.value),
        );
        localStorage.setItem(
          ENHANCED_PRODUCTION_KEY,
          JSON.stringify(ProductionLabors.value),
        );
        localStorage.setItem(
          ENHANCED_INSTALLATION_KEY,
          JSON.stringify(InstallationLabors.value),
        );
      } catch (err) {
        console.error(
          "[LaborsState] Failed to save enhanced labors to cache",
          err,
        );
      }
    };

    // Initialize enhanced labors from API data, separated by WorkOrderType
    const initializeEnhancedLabors = (): void => {
      if (!ApiLaborItems.value) return;

      // Build existing maps for each type
      const existingDrafting = new Map(
        DraftingLabors.value.map((l) => [
          l.LaborId,
          { Sequence: l.Sequence, IsEnabled: l.IsEnabled },
        ]),
      );
      const existingProduction = new Map(
        ProductionLabors.value.map((l) => [
          l.LaborId,
          { Sequence: l.Sequence, IsEnabled: l.IsEnabled },
        ]),
      );
      const existingInstallation = new Map(
        InstallationLabors.value.map((l) => [
          l.LaborId,
          { Sequence: l.Sequence, IsEnabled: l.IsEnabled },
        ]),
      );

      // Separate API items by WorkOrderType
      const drafting: EnhancedLaborItem[] = [];
      const production: EnhancedLaborItem[] = [];
      const installation: EnhancedLaborItem[] = [];

      ApiLaborItems.value.forEach((labor) => {
        const existing =
          labor.WorkOrderType === "Drafting"
            ? existingDrafting.get(labor.LaborId)
            : labor.WorkOrderType === "Production"
              ? existingProduction.get(labor.LaborId)
              : labor.WorkOrderType === "Installation"
                ? existingInstallation.get(labor.LaborId)
                : null;

        const enhanced: EnhancedLaborItem = {
          ...labor,
          Sequence: existing?.Sequence ?? 0,
          IsEnabled: existing?.IsEnabled ?? true,
        };

        if (labor.WorkOrderType === "Drafting") drafting.push(enhanced);
        else if (labor.WorkOrderType === "Production")
          production.push(enhanced);
        else if (labor.WorkOrderType === "Installation")
          installation.push(enhanced);
      });

      // Assign sequences for each list
      drafting.forEach((l, i) => {
        if (l.Sequence === 0) l.Sequence = i + 1;
      });
      production.forEach((l, i) => {
        if (l.Sequence === 0) l.Sequence = i + 1;
      });
      installation.forEach((l, i) => {
        if (l.Sequence === 0) l.Sequence = i + 1;
      });

      // Sort by sequence
      drafting.sort((a, b) => a.Sequence - b.Sequence);
      production.sort((a, b) => a.Sequence - b.Sequence);
      installation.sort((a, b) => a.Sequence - b.Sequence);

      DraftingLabors.value = drafting;
      ProductionLabors.value = production;
      InstallationLabors.value = installation;

      saveEnhancedLaborsToCache();
    };

    // Load labor items from API
    const LoadLaborItems = async (): Promise<void> => {
      const key = (config$.Key ?? "").trim();
      if (!key) {
        app$.setAppStatus("error", "Missing API key for labor items.");
        return;
      }
      app$.showLoading();
      IsLoadingLaborItems.value = true;
      nrg.SetKey(key);
      try {
        const laborItems = await nrg.GetLaborItems();
        ApiLaborItems.value = laborItems;
        LaborItemsCache.save(laborItems);
        initializeEnhancedLabors();
        app$.setAppStatus("success", "Labor items loaded.");
      } catch (err) {
        const fallbackUsed = loadApiLaborsFromCache();
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        if (fallbackUsed) {
          initializeEnhancedLabors();
          app$.setAppStatus("error", "Labor items failed. Using cached data.");
        } else {
          app$.setAppStatus("error", `Labor items failed: ${message}`);
        }
      } finally {
        IsLoadingLaborItems.value = false;
        app$.hideLoading();
      }
    };

    // Helper to find labor in any list
    const findLaborInList = (
      laborId: string,
    ): { list: EnhancedLaborItem[]; labor: EnhancedLaborItem } | null => {
      let labor = DraftingLabors.value.find((l) => l.LaborId === laborId);
      if (labor) return { list: DraftingLabors.value, labor };

      labor = ProductionLabors.value.find((l) => l.LaborId === laborId);
      if (labor) return { list: ProductionLabors.value, labor };

      labor = InstallationLabors.value.find((l) => l.LaborId === laborId);
      if (labor) return { list: InstallationLabors.value, labor };

      return null;
    };

    // Toggle labor enabled state
    const ToggleLaborEnabled = (laborId: string): void => {
      const found = findLaborInList(laborId);
      if (found) {
        found.labor.IsEnabled = !found.labor.IsEnabled;
        saveEnhancedLaborsToCache();
      }
    };

    // Set all labors enabled/disabled for a specific type
    const SetAllLaborsEnabled = (
      enabled: boolean,
      type?: "Drafting" | "Production" | "Installation",
    ): void => {
      if (!type || type === "Drafting") {
        DraftingLabors.value.forEach((l) => (l.IsEnabled = enabled));
      }
      if (!type || type === "Production") {
        ProductionLabors.value.forEach((l) => (l.IsEnabled = enabled));
      }
      if (!type || type === "Installation") {
        InstallationLabors.value.forEach((l) => (l.IsEnabled = enabled));
      }
      saveEnhancedLaborsToCache();
    };

    // Move labor up or down in sequence within its type list
    const MoveLabor = (laborId: string, direction: "up" | "down"): void => {
      const found = findLaborInList(laborId);
      if (!found) return;

      const idx = found.list.findIndex((l) => l.LaborId === laborId);
      if (idx === -1) return;

      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= found.list.length) return;

      const tmp = found.list[idx]!;
      found.list[idx] = found.list[swapWith]!;
      found.list[swapWith] = tmp;

      // Update sequences
      found.list.forEach((l, i) => (l.Sequence = i + 1));
      saveEnhancedLaborsToCache();
    };

    // Computed: All enhanced labors combined
    const AllEnhancedLabors = computed(() => {
      return [
        ...DraftingLabors.value,
        ...ProductionLabors.value,
        ...InstallationLabors.value,
      ];
    });

    // Computed: Only enabled labors
    const EnabledLaborIds = computed(() => {
      return new Set(
        AllEnhancedLabors.value
          .filter((l) => l.IsEnabled)
          .map((l) => l.LaborId),
      );
    });

    // Load from cache on init
    loadApiLaborsFromCache();
    loadEnhancedLaborsFromCache();
    if (
      ApiLaborItems.value &&
      DraftingLabors.value.length === 0 &&
      ProductionLabors.value.length === 0 &&
      InstallationLabors.value.length === 0
    ) {
      initializeEnhancedLabors();
    }

    return {
      ApiLaborItems,
      DraftingLabors,
      ProductionLabors,
      InstallationLabors,
      AllEnhancedLabors,
      EnabledLaborIds,
      IsLoadingLaborItems,
      LoadLaborItems,
      ToggleLaborEnabled,
      SetAllLaborsEnabled,
      MoveLabor,
    };
  },
);
