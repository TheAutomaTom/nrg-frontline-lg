import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { LaborItemsCache } from "@/Data/Caches/ProdGantt/LaborItemsCache";
import { EnabledLaborsCache } from "@/Data/Caches/ProdGantt/EnabledLaborsCache";
import { LaborOrderCache } from "../../../../Data/Caches/ProdGantt/LaborOrderCache";
import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";

export const useLaborsAndOperationsState = defineStore(
  "LaborsAndOperationsState",
  () => {
    const app$ = useAppState();
    const config$ = useUserConfigState();
    const nrg = app$.NrgClient ?? new NrgClient();

    const LaborItems = ref<LaborItemDto[] | null>(null);
    const EnabledLaborIds = ref<Set<string>>(new Set());
    const LaborOrder = ref<string[] | null>(null);
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

    const loadLaborOrderFromCache = (): void => {
      const cached = LaborOrderCache.load();
      if (cached && cached.length) {
        LaborOrder.value = cached;
      } else if (LaborItems.value) {
        LaborOrder.value = LaborItems.value.map((l) => l.LaborId);
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
        loadLaborOrderFromCache();
        app$.setAppStatus("success", "Labor items loaded.");
      } catch (err) {
        const fallbackUsed = loadLaborItemsFromCache();
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        if (fallbackUsed) {
          loadEnabledLaborsFromCache();
          loadLaborOrderFromCache();
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

    const SaveLaborOrder = (orderIds: string[]): void => {
      LaborOrder.value = orderIds.slice();
      LaborOrderCache.save(orderIds);
    };

    const MoveLabor = (laborId: string, direction: "up" | "down"): void => {
      if (!LaborOrder.value) return;
      const idx = LaborOrder.value.indexOf(laborId);
      if (idx === -1) return;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= LaborOrder.value.length) return;
      // Defensive: ensure both indices are valid and defined
      const newOrder = [...LaborOrder.value];
      if (
        typeof newOrder[idx] !== "string" ||
        typeof newOrder[swapWith] !== "string"
      ) {
        return;
      }
      // Now both are string
      const a: string = newOrder[idx]!;
      const b: string = newOrder[swapWith]!;
      newOrder[idx] = b;
      newOrder[swapWith] = a;
      SaveLaborOrder(newOrder);
    };

    const OrderedLaborItems = () => {
      if (!LaborItems.value) return [] as LaborItemDto[];
      if (!LaborOrder.value) return LaborItems.value;
      const byId = new Map(
        LaborItems.value.map((l) => [l.LaborId, l] as const),
      );
      const ordered: LaborItemDto[] = [];
      for (const id of LaborOrder.value) {
        const item = byId.get(id);
        if (item) ordered.push(item);
      }
      // append any new items not in order yet
      for (const item of LaborItems.value) {
        if (!LaborOrder.value.includes(item.LaborId)) ordered.push(item);
      }
      return ordered;
    };

    // Load from cache on init
    loadLaborItemsFromCache();
    loadEnabledLaborsFromCache();
    loadLaborOrderFromCache();

    return {
      LaborItems,
      EnabledLaborIds,
      LaborOrder,
      IsLoadingLaborItems,
      LoadLaborItems,
      ToggleLaborEnabled,
      IsLaborEnabled,
      SetAllLaborsEnabled,
      SaveLaborOrder,
      MoveLabor,
      OrderedLaborItems,
    };
  },
);
