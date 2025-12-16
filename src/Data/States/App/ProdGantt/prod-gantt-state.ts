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

  // Selected Projects State (stores project numbers, not IDs)
  const SelectedProjectNumbers = ref<string[]>([]);

  const LoadLaborKanbanGridItems = async (): Promise<void> => {
    const key = (config$.Key ?? "").trim();
    if (!key) {
      app$.setAppStatus(
        "error",
        "Missing API key for labor kanban grid items.",
      );
      return;
    }

    // Check if we have selected projects
    if (SelectedProjectNumbers.value.length === 0) {
      app$.setAppStatus(
        "error",
        "No projects selected. Please select projects first.",
      );
      return;
    }

    app$.showLoading();
    IsLoadingTickets.value = true;
    nrg.SetKey(key);

    try {
      console.log(
        `[ProdGanttState] Loading data for ${SelectedProjectNumbers.value.length} selected projects...`,
      );

      // Load data for each selected project individually
      const promises = SelectedProjectNumbers.value.map((projectNumber) =>
        nrg.GetLaborKanbanGridItemsByProjectNumber(projectNumber),
      );

      const results = await Promise.all(promises);

      // Merge all results into a single LaborKanbanGridItemsDto
      const mergedItems = results.flatMap((result) => result.Items || []);

      LaborKanbanGridItems.value = {
        CreateDate: new Date().toISOString(),
        Items: mergedItems,
      };

      app$.setAppStatus(
        "success",
        `Loaded ${mergedItems.length} labor items from ${SelectedProjectNumbers.value.length} project(s).`,
      );
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
      SelectedProjectNumbers.value = cached;
      console.log(
        `[ProdGanttState] Loaded ${cached.length} selected project numbers from cache`,
      );
    }
  };

  const SaveSelectedProjects = (projectNumbers: string[]): void => {
    SelectedProjectNumbers.value = projectNumbers;
    SelectedProjectsCache.save(projectNumbers);
    console.log(
      `[ProdGanttState] Saved ${projectNumbers.length} selected project numbers`,
    );
  };

  const ToggleProjectSelection = (projectNumber: string): void => {
    const index = SelectedProjectNumbers.value.indexOf(projectNumber);
    if (index > -1) {
      SelectedProjectNumbers.value.splice(index, 1);
    } else {
      SelectedProjectNumbers.value.push(projectNumber);
    }
    SelectedProjectsCache.save(SelectedProjectNumbers.value);
  };

  const ClearSelectedProjects = (): void => {
    SelectedProjectNumbers.value = [];
    SelectedProjectsCache.clear();
  };

  // Load cached selected projects on initialization
  LoadSelectedProjects();

  return {
    LaborKanbanGridItems,
    IsLoadingTickets,
    LoadLaborKanbanGridItems,
    // Selected Projects (by project number)
    SelectedProjectNumbers,
    SaveSelectedProjects,
    ToggleProjectSelection,
    ClearSelectedProjects,
    LoadSelectedProjects,
  };
});
