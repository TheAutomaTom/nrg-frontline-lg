import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { LaborItemsCache } from "@/Data/Caches/ProdGantt/LaborItemsCache";
import { EnabledLaborsCache } from "@/Data/Caches/ProdGantt/EnabledLaborsCache";
import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";

export const useLaborsAndOperationsState = defineStore(
  "LaborsAndOperationsState",
  () => {
    const app$ = useAppState();
    const config$ = useUserConfigState();
    const nrg = app$.NrgClient ?? new NrgClient();

    const LaborItems = ref<LaborItemDto[] | null>(null);
    const EnabledLaborIds = ref<Set<string>>(new Set());
    const IsLoadingLaborItems = ref(false);

    const loadLaborItemsFromCache = (): boolean => {
      const cached = LaborItemsCache.load();
      if (cached) {
        LaborItems.value = cached;
        return true;
      }
      return false;
    };

    const loadEnabledLaborsFromCache = (): void => {
      const cached = EnabledLaborsCache.load();
      if (cached) {
        EnabledLaborIds.value = new Set(cached);
      } else if (LaborItems.value) {
        // Default: all items enabled
        EnabledLaborIds.value = new Set(LaborItems.value.map((l) => l.LaborId));
      }
    };

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
        LaborItems.value = laborItems;
        LaborItemsCache.save(laborItems);
        loadEnabledLaborsFromCache();
        app$.setAppStatus("success", "Labor items loaded.");
      } catch (err) {
        const fallbackUsed = loadLaborItemsFromCache();
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        if (fallbackUsed) {
          loadEnabledLaborsFromCache();
          app$.setAppStatus("error", "Labor items failed. Using cached data.");
        } else {
          app$.setAppStatus("error", `Labor items failed: ${message}`);
        }
      } finally {
        IsLoadingLaborItems.value = false;
        app$.hideLoading();
      }
    };

    const ToggleLaborEnabled = (laborId: string): void => {
      if (EnabledLaborIds.value.has(laborId)) {
        EnabledLaborIds.value.delete(laborId);
      } else {
        EnabledLaborIds.value.add(laborId);
      }
      EnabledLaborsCache.save(Array.from(EnabledLaborIds.value));
    };

    const IsLaborEnabled = (laborId: string): boolean => {
      return EnabledLaborIds.value.has(laborId);
    };

    const SetAllLaborsEnabled = (enabled: boolean): void => {
      if (enabled && LaborItems.value) {
        EnabledLaborIds.value = new Set(LaborItems.value.map((l) => l.LaborId));
      } else {
        EnabledLaborIds.value.clear();
      }
      EnabledLaborsCache.save(Array.from(EnabledLaborIds.value));
    };

    // Load from cache on init
    loadLaborItemsFromCache();
    loadEnabledLaborsFromCache();

    return {
      LaborItems,
      EnabledLaborIds,
      IsLoadingLaborItems,
      LoadLaborItems,
      ToggleLaborEnabled,
      IsLaborEnabled,
      SetAllLaborsEnabled,
    };
  },
);
