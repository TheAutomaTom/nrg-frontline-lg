import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { useWorkflowsState } from "./workflows-state";
import { useWorkWeekState } from "./work-week-state";
import type {
  LaborKanbanGridItemsDto,
  TicketDto,
} from "@/Core/Models/nrg-dtos/ProdGantt/Ticket";
import type { WorkflowStep } from "@/Core/Models/ProdGantt/WorkflowStep";
import type { LaborItemDto } from "@/Core/Models/nrg-dtos/LaborItemDto";
import { SelectedProjectsCache } from "@/Data/Caches/ProdGantt/SelectedProjectsCache";
import { WeekDay } from "@/Core/Models/ProdGantt/WeekDay";

export interface LaborItemSchedule {
  laborItem: TicketDto;
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}

export interface GroupedStep {
  stepName: string;
  sequence: number;
  items: TicketDto[];
  schedule: LaborItemSchedule[];
  stepStartDate: Date | null;
  stepEndDate: Date | null;
}

export interface GroupedWorkOrder {
  workOrderKey: string;
  workOrderNumber: string;
  workOrderName: string;
  workOrderStatus: string;
  plannedCriticalDate: string;
  steps: GroupedStep[];
}

export interface GroupedProject {
  projectKey: string;
  projectNumber: string;
  projectName: string;
  workOrders: GroupedWorkOrder[];
}

export const useProdGanttState = defineStore("ProdGanttState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const workflows$ = useWorkflowsState();
  const workWeek$ = useWorkWeekState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const LaborKanbanGridItems = ref<LaborKanbanGridItemsDto | null>(null);
  const IsLoadingTickets = ref(false);

  // Selected Projects State (stores project numbers, not IDs)
  const SelectedProjectNumbers = ref<string[]>([]);

  // ==================== SCHEDULING UTILITY FUNCTIONS ====================

  function parseDurationToMinutes(duration: string | null): number {
    if (!duration) return 0;

    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const firstColonIndex = duration.indexOf(":");
    const firstDotIndex = duration.indexOf(".");

    if (firstDotIndex !== -1 && firstDotIndex < firstColonIndex) {
      days = parseInt(duration.substring(0, firstDotIndex));
      const afterDays = duration.substring(firstDotIndex + 1);
      const timeParts = afterDays.split(":");
      hours = parseInt(timeParts[0] || "0");
      minutes = parseInt(timeParts[1] || "0");
      const secondsStr = (timeParts[2] || "0").split(".")[0] || "0";
      seconds = parseInt(secondsStr);
    } else {
      const timeParts = duration.split(":");
      hours = parseInt(timeParts[0] || "0");
      minutes = parseInt(timeParts[1] || "0");
      const secondsStr = (timeParts[2] || "0").split(".")[0] || "0";
      seconds = parseInt(secondsStr);
    }

    let totalMinutes = days * 24 * 60 + hours * 60 + minutes;
    if (seconds > 0) {
      totalMinutes += 1;
    }

    return totalMinutes;
  }

  function getWeekDayFromDate(date: Date): WeekDay {
    const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dayMap: WeekDay[] = [
      WeekDay.Sunday,
      WeekDay.Monday,
      WeekDay.Tuesday,
      WeekDay.Wednesday,
      WeekDay.Thursday,
      WeekDay.Friday,
      WeekDay.Saturday,
    ];
    return dayMap[dayIndex] || WeekDay.Monday;
  }

  function isWorkingDay(date: Date, typicalDays: WeekDay[]): boolean {
    const weekDay = getWeekDayFromDate(date);
    return typicalDays.includes(weekDay);
  }

  function subtractWorkingMinutes(endDate: Date, minutes: number): Date {
    if (!workWeek$.DefaultWorkWeek) return endDate;

    const workWeek = workWeek$.DefaultWorkWeek;
    const hoursPerDay = workWeek.HoursPerDay;
    const minutesPerDay = hoursPerDay * 60;
    const typicalDays = workWeek.WorkingDays.Typical;

    // Parse start of day time
    const timeParts = workWeek.StartOfDay.split(":").map(Number);
    const startHour = timeParts[0] || 8;
    const startMinute = timeParts[1] || 0;

    let remainingMinutes = minutes;
    const currentDate = new Date(endDate);

    // Start at end of work day
    currentDate.setHours(startHour + hoursPerDay, startMinute, 0, 0);

    while (remainingMinutes > 0) {
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);

      // Check if it's a working day
      if (isWorkingDay(currentDate, typicalDays)) {
        if (remainingMinutes >= minutesPerDay) {
          remainingMinutes -= minutesPerDay;
        } else {
          // Partial day - set to start of day plus remaining minutes
          currentDate.setHours(startHour, startMinute, 0, 0);
          currentDate.setMinutes(currentDate.getMinutes() + remainingMinutes);
          remainingMinutes = 0;
        }
      }
    }

    // Set to start of work day for the final date
    if (remainingMinutes === 0) {
      currentDate.setHours(startHour, startMinute, 0, 0);
    }

    return currentDate;
  }

  function addWorkingMinutes(startDate: Date, minutes: number): Date {
    if (!workWeek$.DefaultWorkWeek) return startDate;

    const workWeek = workWeek$.DefaultWorkWeek;
    const hoursPerDay = workWeek.HoursPerDay;
    const minutesPerDay = hoursPerDay * 60;
    const typicalDays = workWeek.WorkingDays.Typical;

    // Parse start of day time
    const timeParts = workWeek.StartOfDay.split(":").map(Number);
    const startHour = timeParts[0] || 8;
    const startMinute = timeParts[1] || 0;

    let remainingMinutes = minutes;
    const currentDate = new Date(startDate);

    while (remainingMinutes > 0) {
      // Check if current day is a working day
      if (isWorkingDay(currentDate, typicalDays)) {
        // Calculate minutes left in current work day
        const currentHour = currentDate.getHours();
        const currentMinuteInHour = currentDate.getMinutes();
        const minutesFromStartOfDay =
          (currentHour - startHour) * 60 + (currentMinuteInHour - startMinute);
        const minutesLeftInDay = minutesPerDay - minutesFromStartOfDay;

        if (remainingMinutes <= minutesLeftInDay) {
          // Can complete within current day
          currentDate.setMinutes(currentDate.getMinutes() + remainingMinutes);
          remainingMinutes = 0;
        } else {
          // Move to start of next day
          remainingMinutes -= minutesLeftInDay;
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(startHour, startMinute, 0, 0);
        }
      } else {
        // Skip non-working day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(startHour, startMinute, 0, 0);
      }
    }

    return currentDate;
  }

  function calculateWorkOrderSchedule(workOrder: GroupedWorkOrder): void {
    if (!workOrder.plannedCriticalDate || workOrder.steps.length === 0) return;

    const criticalDate = new Date(workOrder.plannedCriticalDate);

    // Work backward from the last step
    let currentEndDate = criticalDate;

    // Process steps in reverse order (last to first)
    for (let i = workOrder.steps.length - 1; i >= 0; i--) {
      const step = workOrder.steps[i];
      if (!step) continue;

      // Find the longest duration labor item in this step (parallel execution)
      const maxDurationMinutes = Math.max(
        ...step.items.map((item) =>
          parseDurationToMinutes(item.LaborPlannedDuration),
        ),
        0, // Fallback if no items
      );

      // Work backwards: the longest item must complete exactly at currentEndDate
      // Calculate when all items in this step must start (they all start together)
      const stepStartDate = subtractWorkingMinutes(
        currentEndDate,
        maxDurationMinutes,
      );

      step.stepStartDate = new Date(stepStartDate);
      step.stepEndDate = new Date(currentEndDate);

      // Schedule individual labor items within the step
      // All items START at the step start date (parallel execution)
      step.schedule = [];

      for (const item of step.items) {
        if (!item) continue;

        const itemDuration = parseDurationToMinutes(item.LaborPlannedDuration);

        // All items in the same step start at the same time
        const itemStartDate = new Date(stepStartDate);

        // Each item ends based on its own duration from the step start
        const itemEndDate = addWorkingMinutes(itemStartDate, itemDuration);

        step.schedule.push({
          laborItem: item,
          startDate: itemStartDate,
          endDate: itemEndDate,
          durationMinutes: itemDuration,
        });
      }

      // Previous step must end when this step starts (no gaps)
      currentEndDate = new Date(stepStartDate);
    }
  }

  function findStepForLaborItem(item: TicketDto): WorkflowStep | undefined {
    // Search through all workflows and their steps to find a match by labor item name
    if (!workflows$.WorkflowStepsMap) return undefined;

    for (const workflowId in workflows$.WorkflowStepsMap) {
      const steps = workflows$.WorkflowStepsMap[workflowId];
      const matchingStep = steps?.find((step) =>
        step.LaborItems?.some(
          (labor: LaborItemDto) => labor.Name === item.LaborItemName,
        ),
      );

      if (matchingStep) {
        return matchingStep;
      }
    }

    return undefined;
  }

  // ==================== COMPUTED: GROUPED AND SCHEDULED PROJECTS ====================

  const GroupedProjectsWithSchedule = computed<GroupedProject[]>(() => {
    if (!LaborKanbanGridItems.value?.Items) return [];

    // Get selected project numbers
    const selectedProjectNumbers = new Set(SelectedProjectNumbers.value);

    // If no projects are selected, show nothing
    if (selectedProjectNumbers.size === 0) return [];

    const projectMap = new Map<string, GroupedProject>();

    LaborKanbanGridItems.value.Items.forEach((item) => {
      // Filter: only include items from selected projects
      if (!selectedProjectNumbers.has(item.ProjectNumber)) {
        return; // Skip this item
      }

      const projectKey = `${item.ProjectNumber}`;

      if (!projectMap.has(projectKey)) {
        projectMap.set(projectKey, {
          projectKey,
          projectNumber: item.ProjectNumber,
          projectName: item.ProjectName,
          workOrders: [],
        });
      }

      const project = projectMap.get(projectKey)!;
      let workOrder = project.workOrders.find(
        (wo) => wo.workOrderNumber === item.WorkOrderNumber,
      );

      if (!workOrder) {
        workOrder = {
          workOrderKey: item.WorkOrderNumber,
          workOrderNumber: item.WorkOrderNumber,
          workOrderName: item.WorkOrderName,
          workOrderStatus: item.WorkOrderStatus,
          plannedCriticalDate: item.PlannedCriticalDate,
          steps: [],
        };
        project.workOrders.push(workOrder);
      }

      // Find the workflow step for this labor item by searching all workflows
      const matchingStep = findStepForLaborItem(item);

      const stepName = matchingStep
        ? matchingStep.Name
        : "Unassigned Labor Items";
      const stepSequence = matchingStep ? matchingStep.Sequence : 9999;

      let step = workOrder.steps.find((s) => s.stepName === stepName);
      if (!step) {
        step = {
          stepName,
          sequence: stepSequence,
          items: [],
          schedule: [],
          stepStartDate: null,
          stepEndDate: null,
        };
        workOrder.steps.push(step);
      }

      step.items.push(item);
    });

    // Sort steps within each work order by sequence and calculate schedules
    projectMap.forEach((project) => {
      // Sort work orders by due date (plannedCriticalDate)
      project.workOrders.sort((a, b) => {
        const dateA = a.plannedCriticalDate
          ? new Date(a.plannedCriticalDate).getTime()
          : 0;
        const dateB = b.plannedCriticalDate
          ? new Date(b.plannedCriticalDate).getTime()
          : 0;
        return dateA - dateB;
      });

      project.workOrders.forEach((workOrder) => {
        workOrder.steps.sort((a, b) => a.sequence - b.sequence);

        // Calculate schedule for this work order
        calculateWorkOrderSchedule(workOrder);
      });
    });

    return Array.from(projectMap.values());
  });

  // ==================== EXISTING FUNCTIONS ====================

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
    // Grouped and Scheduled Data
    GroupedProjectsWithSchedule,
  };
});
