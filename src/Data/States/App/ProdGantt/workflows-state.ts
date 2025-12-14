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
  const WorkflowSource = ref<"api" | "cache" | null>(null);
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
      const hasCachedData = loadWorkflowsFromCache();
      if (hasCachedData) {
        WorkflowSource.value = "cache";
        app$.setAppStatus("success", "Cached workflows loaded.");
      } else {
        const workflows = await nrg.GetWorkflows();
        Workflows.value = workflows;
        WorkflowsCache.save(workflows);
        WorkflowSource.value = "api";
        app$.setAppStatus("success", "Workflows loaded from API.");
      }
    } catch (err) {
      const message =
        (err as Error)?.message ||
        (typeof err === "string" ? err : "Unknown error");
      app$.setAppStatus("error", `Workflows failed: ${message}`);
    } finally {
      IsLoadingWorkflows.value = false;
      app$.hideLoading();
    }
  };

  // Load cached workflows on store initialization
  loadWorkflowsFromCache();

  return {
    Workflows,
    WorkflowSource,
    IsLoadingWorkflows,
    LoadWorkflows,
  };
});
