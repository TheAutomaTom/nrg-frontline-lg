import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import type { LaborKanbanGridItemsDto } from "@/Core/Models/nrg-dtos/ProdGantt/Ticket";
import { SelectedProjectsCache } from "@/Data/Caches/ProdGantt/SelectedProjectsCache";

export const useProdGanttState = defineStore("ProdGanttState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const LaborKanbanGridItems = ref<LaborKanbanGridItemsDto | null>(null);
  const IsLoadingTickets = ref(false);

  // Selected Projects State
  const SelectedProjectIds = ref<string[]>([]);

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

  const LoadSelectedProjects = (): void => {
    const cached = SelectedProjectsCache.load();
    if (cached) {
      SelectedProjectIds.value = cached;
      console.log(
        `[ProdGanttState] Loaded ${cached.length} selected projects from cache`,
      );
    }
  };

  const SaveSelectedProjects = (projectIds: string[]): void => {
    SelectedProjectIds.value = projectIds;
    SelectedProjectsCache.save(projectIds);
    console.log(
      `[ProdGanttState] Saved ${projectIds.length} selected projects`,
    );
  };

  const ToggleProjectSelection = (projectId: string): void => {
    const index = SelectedProjectIds.value.indexOf(projectId);
    if (index > -1) {
      SelectedProjectIds.value.splice(index, 1);
    } else {
      SelectedProjectIds.value.push(projectId);
    }
    SelectedProjectsCache.save(SelectedProjectIds.value);
  };

  const ClearSelectedProjects = (): void => {
    SelectedProjectIds.value = [];
    SelectedProjectsCache.clear();
  };

  // Load cached selected projects on initialization
  LoadSelectedProjects();

  return {
    LaborKanbanGridItems,
    IsLoadingTickets,
    LoadLaborKanbanGridItems,
    // Selected Projects
    SelectedProjectIds,
    SaveSelectedProjects,
    ToggleProjectSelection,
    ClearSelectedProjects,
    LoadSelectedProjects,
  };
});
