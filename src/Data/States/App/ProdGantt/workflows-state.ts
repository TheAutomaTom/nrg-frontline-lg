import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { WorkflowsCache } from "@/Data/Caches/ProdGantt/WorkflowsCache";
import type { WorkflowDto } from "@/Core/Models/nrg-dtos/WorkflowDto";

export const useWorkflowsState = defineStore("WorkflowsState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const Workflows = ref<WorkflowDto[] | null>(null);
  const IsLoadingWorkflows = ref(false);

  const loadWorkflowsFromCache = (): boolean => {
    const cached = WorkflowsCache.load();
    if (cached) {
      Workflows.value = cached;
      return true;
    }
    return false;
  };

  const LoadWorkflows = async (): Promise<void> => {
    const key = (config$.Key ?? "").trim();
    if (!key) {
      app$.setAppStatus("error", "Missing API key for workflows.");
      return;
    }
    app$.showLoading();
    IsLoadingWorkflows.value = true;
    nrg.SetKey(key);
    try {
      const workflows = await nrg.GetWorkflows();
      Workflows.value = workflows;
      WorkflowsCache.save(workflows);
      app$.setAppStatus("success", "Workflows loaded.");
    } catch (err) {
      const fallbackUsed = loadWorkflowsFromCache();
      const message =
        (err as Error)?.message ||
        (typeof err === "string" ? err : "Unknown error");
      if (fallbackUsed) {
        app$.setAppStatus("error", "Workflows failed. Using cached data.");
      } else {
        app$.setAppStatus("error", `Workflows failed: ${message}`);
      }
    } finally {
      IsLoadingWorkflows.value = false;
      app$.hideLoading();
    }
  };

  // Load cached workflows on store initialization
  loadWorkflowsFromCache();

  return {
    Workflows,
    IsLoadingWorkflows,
    LoadWorkflows,
  };
});
