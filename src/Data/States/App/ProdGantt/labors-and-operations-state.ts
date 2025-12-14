import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { LaborItemsCache } from "@/Data/Caches/ProdGantt/LaborItemsCache";
import { OperationsCache } from "@/Data/Caches/ProdGantt/OperationsCache";
import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";
import type { OperationDto } from "@/Core/Models/nrg-dtos/Operation/OperationDto";

export const useLaborsAndOperationsState = defineStore(
  "LaborsAndOperationsState",
  () => {
    const app$ = useAppState();
    const config$ = useUserConfigState();
    const nrg = app$.NrgClient ?? new NrgClient();

    const LaborItems = ref<LaborItemDto[] | null>(null);
    const Operations = ref<OperationDto[] | null>(null);

    const IsLoadingLaborItems = ref(false);
    const IsLoadingOperations = ref(false);

    const loadLaborItemsFromCache = (): boolean => {
      const cached = LaborItemsCache.load();
      if (cached) {
        LaborItems.value = cached;
        return true;
      }
      return false;
    };

    const loadOperationsFromCache = (): boolean => {
      const cached = OperationsCache.load();
      if (cached) {
        Operations.value = cached;
        return true;
      }
      return false;
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
        app$.setAppStatus("success", "Labor items loaded.");
      } catch (err) {
        const fallbackUsed = loadLaborItemsFromCache();
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        if (fallbackUsed) {
          app$.setAppStatus("error", "Labor items failed. Using cached data.");
        } else {
          app$.setAppStatus("error", `Labor items failed: ${message}`);
        }
      } finally {
        IsLoadingLaborItems.value = false;
        app$.hideLoading();
      }
    };

    const LoadOperations = async (): Promise<void> => {
      const key = (config$.Key ?? "").trim();
      if (!key) {
        app$.setAppStatus("error", "Missing API key for operations.");
        return;
      }
      app$.showLoading();
      IsLoadingOperations.value = true;
      nrg.SetKey(key);
      try {
        const operationsResult = await nrg.GetOperations();
        const operations = operationsResult.Items ?? [];
        Operations.value = operations;
        OperationsCache.save(operations);
        app$.setAppStatus("success", "Operations loaded.");
      } catch (err) {
        const fallbackUsed = loadOperationsFromCache();
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        if (fallbackUsed) {
          app$.setAppStatus("error", "Operations failed. Using cached data.");
        } else {
          app$.setAppStatus("error", `Operations failed: ${message}`);
        }
      } finally {
        IsLoadingOperations.value = false;
        app$.hideLoading();
      }
    };

    return {
      LaborItems,
      Operations,
      IsLoadingLaborItems,
      IsLoadingOperations,
      LoadLaborItems,
      LoadOperations,
    };
  },
);
