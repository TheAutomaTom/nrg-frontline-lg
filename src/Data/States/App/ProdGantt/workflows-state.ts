import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { WorkflowsCache } from "@/Data/Caches/ProdGantt/WorkflowsCache";
import { WorkflowStepsCache } from "@/Data/Caches/ProdGantt/WorkflowStepsCache";
import type { WorkflowDto } from "@/Core/Models/nrg-dtos/WorkflowDto";
import type { WorkflowStep } from "@/Core/Models/ProdGantt/WorkflowStep";
import type { ProjectDto } from "@/Core/Models/nrg-dtos/Project/ProjectDto";
import type { WorkOrderDto } from "@/Core/Models/nrg-dtos/WorkOrderDto";
import { generateGuid } from "@/Core/Features/GuidGenerator";

interface ProjectWithWorkOrders {
  project: ProjectDto;
  workOrders: WorkOrderDto[];
}

export const useWorkflowsState = defineStore("WorkflowsState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const Workflows = ref<WorkflowDto[] | null>(null);
  const WorkflowSource = ref<"api" | "cache" | null>(null);
  const IsLoadingWorkflows = ref(false);
  const WorkflowStepsMap = ref<Record<string, WorkflowStep[]>>({});

  // Project and Work Order State
  const Projects = ref<ProjectDto[]>([]);
  const ProjectWorkOrdersMap = ref<Record<string, WorkOrderDto[]>>({});
  const IsLoadingProjects = ref(false);
  const FilterEndDate = ref<Date | null>(null);

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

  // ===================== PROJECT AND WORK ORDER FUNCTIONS =====================

  const LoadProjectsWithWorkOrders = async (): Promise<void> => {
    const key = (config$.Key ?? "").trim();
    if (!key) {
      app$.setAppStatus("error", "Missing API key for projects.");
      return;
    }

    app$.showLoading();
    IsLoadingProjects.value = true;
    nrg.SetKey(key);

    try {
      console.log("[WorkflowsState] Loading projects...");
      const projects = await nrg.GetProjects(key);
      Projects.value = projects;

      console.log("[WorkflowsState] Loading work orders...");
      const allWorkOrders = await nrg.GetWorkOrders(key);

      // Group work orders by project number
      const workOrdersByProject: Record<string, WorkOrderDto[]> = {};
      allWorkOrders.forEach((wo) => {
        const projNum = wo.ProjectNumber;
        if (!workOrdersByProject[projNum]) {
          workOrdersByProject[projNum] = [];
        }
        workOrdersByProject[projNum].push(wo);
      });

      ProjectWorkOrdersMap.value = workOrdersByProject;

      app$.setAppStatus(
        "success",
        `Loaded ${projects.length} projects with ${allWorkOrders.length} work orders.`,
      );
    } catch (err) {
      const message =
        (err as Error)?.message ||
        (typeof err === "string" ? err : "Unknown error");
      app$.setAppStatus("error", `Failed to load projects: ${message}`);
    } finally {
      IsLoadingProjects.value = false;
      app$.hideLoading();
    }
  };

  // Computed: Get projects with their work orders
  const ProjectsWithWorkOrders = computed<ProjectWithWorkOrders[]>(() => {
    return Projects.value.map((project) => ({
      project,
      workOrders: ProjectWorkOrdersMap.value[project.Number ?? ""] || [],
    }));
  });

  // Computed: Filter projects by work orders with critical dates in range
  const FilteredProjectsWithWorkOrders = computed<ProjectWithWorkOrders[]>(
    () => {
      const endDate = FilterEndDate.value;
      if (!endDate) {
        // No filter set - show all projects with open work orders
        return ProjectsWithWorkOrders.value.filter(
          (pww) => pww.workOrders.length > 0,
        );
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of selected day

      return ProjectsWithWorkOrders.value
        .map((pww) => {
          // Filter work orders by critical date range
          const filteredWorkOrders = pww.workOrders.filter((wo) => {
            if (!wo.PlannedCriticalDate) return false;
            const criticalDate = new Date(wo.PlannedCriticalDate);
            return criticalDate >= now && criticalDate <= end;
          });

          return {
            project: pww.project,
            workOrders: filteredWorkOrders,
          };
        })
        .filter((pww) => pww.workOrders.length > 0); // Only include projects with matching work orders
    },
  );

  const SetFilterEndDate = (date: Date | null): void => {
    FilterEndDate.value = date;
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
    // Project and Work Order exports
    Projects,
    ProjectWorkOrdersMap,
    IsLoadingProjects,
    FilterEndDate,
    ProjectsWithWorkOrders,
    FilteredProjectsWithWorkOrders,
    LoadProjectsWithWorkOrders,
    SetFilterEndDate,
  };
});
