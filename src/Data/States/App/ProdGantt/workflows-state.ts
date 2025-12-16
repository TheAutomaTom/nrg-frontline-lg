import { defineStore } from "pinia";
import { ref } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { WorkflowsCache } from "@/Data/Caches/ProdGantt/WorkflowsCache";
import { WorkflowStepsCache } from "@/Data/Caches/ProdGantt/WorkflowStepsCache";
import type { WorkflowDto } from "@/Core/Models/nrg-dtos/WorkflowDto";
import type { WorkflowStep } from "@/Core/Models/ProdGantt/WorkflowStep";
import { generateGuid } from "@/Core/Features/GuidGenerator";

export const useWorkflowsState = defineStore("WorkflowsState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const Workflows = ref<WorkflowDto[] | null>(null);
  const WorkflowSource = ref<"api" | "cache" | null>(null);
  const IsLoadingWorkflows = ref(false);
  const WorkflowStepsMap = ref<Record<string, WorkflowStep[]>>({});

  const initializeWorkflowSteps = (workflows: WorkflowDto[]): void => {
    console.log(
      "[WorkflowsState] Initializing workflow steps for",
      workflows.length,
      "workflows",
    );
    workflows.forEach((workflow) => {
      const existingSteps = WorkflowStepsMap.value[workflow.Id];
      if (!existingSteps || existingSteps.length === 0) {
        console.log(
          "[WorkflowsState] Creating default step for workflow:",
          workflow.Name,
        );
        WorkflowStepsMap.value[workflow.Id] = [
          {
            Id: generateGuid(),
            Name: "",
            WorkOrderType: "Drafting",
            Sequence: 1,
            TypicalDayCount: 1,
            LaborItems: [],
          },
        ];
      }
    });
  };

  const loadWorkflowsFromCache = (): boolean => {
    const cached = WorkflowsCache.load();
    if (cached) {
      Workflows.value = cached;

      // Load cached workflow steps if they exist
      const cachedSteps = WorkflowStepsCache.load();
      if (cachedSteps) {
        console.log(
          "[WorkflowsState] Loaded cached workflow steps:",
          Object.keys(cachedSteps).length,
          "workflows",
        );
        WorkflowStepsMap.value = cachedSteps;
      } else {
        console.log("[WorkflowsState] No cached steps found, initializing...");
        initializeWorkflowSteps(cached);
      }

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

    // If we already have workflows loaded from cache, don't reload
    if (Workflows.value && Workflows.value.length > 0) {
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

        // Load cached workflow steps or initialize
        const cachedSteps = WorkflowStepsCache.load();
        if (cachedSteps) {
          WorkflowStepsMap.value = cachedSteps;
        } else {
          initializeWorkflowSteps(workflows);
          WorkflowStepsCache.save(WorkflowStepsMap.value);
        }

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

  const SaveWorkflowSteps = (): void => {
    console.log(
      "[WorkflowsState] Saving workflow steps:",
      Object.keys(WorkflowStepsMap.value).length,
      "workflows",
    );
    WorkflowStepsCache.save(WorkflowStepsMap.value);
  };

  // Load cached workflows on store initialization
  loadWorkflowsFromCache();

  return {
    Workflows,
    WorkflowSource,
    IsLoadingWorkflows,
    WorkflowStepsMap,
    LoadWorkflows,
    SaveWorkflowSteps,
  };
});
