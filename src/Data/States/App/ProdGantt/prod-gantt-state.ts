import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import type { LaborKanbanGridItemsDto } from "@/Core/Models/nrg-dtos/ProdGantt/Ticket";

export const useProdGanttState = defineStore("ProdGanttState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const LaborKanbanGridItems = ref<LaborKanbanGridItemsDto | null>(null);
  const IsLoadingTickets = ref(false);

  const LoadLaborKanbanGridItems = async (): Promise<void> => {
    const key = (config$.Key ?? "").trim();
    if (!key) {
      app$.setAppStatus(
        "error",
        "Missing API key for labor kanban grid items.",
      );
      return;
    }
    app$.showLoading();
    IsLoadingTickets.value = true;
    nrg.SetKey(key);

    try {
      const data = await nrg.GetLaborKanbanGridItems();
      LaborKanbanGridItems.value = data;
      app$.setAppStatus("success", "Labor kanban grid items loaded from API.");
    } catch (err) {
      const message =
        (err as Error)?.message ||
        (typeof err === "string" ? err : "Unknown error");
      app$.setAppStatus("error", `Labor kanban grid items failed: ${message}`);
    } finally {
      IsLoadingTickets.value = false;
      app$.hideLoading();
    }
  };

  return {
    LaborKanbanGridItems,
    IsLoadingTickets,
    LoadLaborKanbanGridItems,
  };
});
