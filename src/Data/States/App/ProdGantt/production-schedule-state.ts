import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { NrgClient } from "@/Data/Clients/NrgClient";
import { useUserConfigState } from "../user-config-state";
import { useAppState } from "../app-state";
import { useWorkflowsState } from "./workflows-state";
import { useWorkWeekState } from "./work-week-state";
import type {
  DateString,
  DurationString,
  LaborKanbanGridItemsDto,
  TicketDto,
} from "@/Core/Models/nrg-dtos/ProdGantt/Ticket";
import { WeekDay } from "@/Core/Models/ProdGantt/WeekDay";
import type { WorkWeek } from "@/Core/Models/ProdGantt/WorkWeek";
import type { ProjectDto } from "@/Core/Models/nrg-dtos/Project/ProjectDto";
import type { WorkOrderDto } from "@/Core/Models/nrg-dtos/WorkOrderDto";

export interface ProductionSchedule {
  Projects: PgProject[];
  WorkWeek: WorkDay[];
  EndDate: Date; // Find the latest Projects[].WOs[].PlannedCriticalDate
}

export interface WorkDay {
  Name: WeekDay;
  Sequence: number;
  IsEnabled?: boolean;
  StartHour: number; // 0-23
  EndHour: number; // hours
  LengthAsMinutes: number; // minutes
}

export interface PgProject {
  Id: string;
  Number: string | null;
  Name: string | null;
  EndDate: Date; // Find the latest TicketDto.PlannedCriticalDate
  WOs: PgWorkOrder[];
}

export interface PgWorkOrder {
  PgTickets: PgTicket[];
  // from WorkOrderDto {
  // PlannedStartDate?: string | null;
  PlannedCriticalDate?: string | null;
  // ActualStartDate?: string | null;
  // FieldVerifiedStepItemPlannedDate?: string | null;
  // FieldVerifiedStepItemActualDate?: string | null;
  ProjectNumber: string;
  ProjectName: string;
  Id: string;
  Number: string;
  Name: string;
  Type: string;
  // CreatedBy: CreatedBy
  // CreatedOn: string
  // Facility: string
  // Outsourced: boolean
  // Tags: string[]
  Status: string;
  // MaterialOnHandDays: number
  // Step: string;
  // StepIndex: number
  // StepType: string;
  // InvoiceStatus: string
  // WorkflowName?: string;
  // Owner?: PersonRefDto;
  // Assignees?: PersonRefDto[];
  // Drafters?: Drafter[]
  // Engineers?: Engineer[]
  // Estimators?: Estimator[]
  // SalesPersons?: SalesPerson[]
  // Coordinators?: Coordinator[]
  // Installers?: Installer[]
  // ProjectManager?: PersonRefDto;
  // PlannedStartDate: string
  // ActualStartDate?: string
  // PlannedCriticalDate: string
  // MaterialNeededDate?: string
  // PlannedEndDate: string
  // PlannedEndMonth: string
  // ActualEndDate?: string
  // ActualEndMonth?: string
  // Instructions: string;
  // EstimatedLaborCost: EstimatedLaborCost
  // EstimatedMaterialCost: EstimatedMaterialCost
  // EstimatedCost: EstimatedCost
  // EstimatedHours: string
  // EstimatedMargin: EstimatedMargin
  // LaborHours: string
  // RemainingHours: string
  // PlannedHours: string
  // LaborCost: LaborCost
  // PlannedLaborCost: PlannedLaborCost
  // LaborGrandTotalPrice: LaborGrandTotalPrice
  // ActualLaborHours: string
  // ActualCost: ActualCost
  // ActualMaterialCost: ActualMaterialCost
  // ActualLaborCost: ActualLaborCost
  // ActualExpensesCost: ActualExpensesCost
  // ActualMargin: ActualMargin
  // MarginVariance: MarginVariance
  // GrandTotalPrice: GrandTotalPrice
  // PreSalesTaxPrice: PreSalesTaxPrice
  // SalesTax: SalesTax
  // ExternalIdentifier: string
  // ProductsQuantitySum: number
  // ShipmentItemsQuantitySum: number
  // ReadyForFieldVerificationStepItemPlannedDate?: string
  // ReadyForFieldVerificationStepItemActualDate?: string
  // FieldVerifiedStepItemPlannedDate?: string
  // FieldVerifiedStepItemActualDate?: string
  // PlannedLaborLastUpdatedDate?: string
  // PercentInstalled: number
  // PercentInstalledLastUpdatedDate?: string
  // ProjectedInstallRemainingHours: string
  // ShipmentDate?: string
  // PlannedShipmentDate?: string
  // ActualShipmentDate?: string
  // JobCostingStatus: string
  // TeamLead?: TeamLead
  // Impediments?: string[]
  // CustomFields: CustomField[]
  // MasterNote?: string;
  // WorkflowStepEnteredDate: string
  // WorkflowStepEnteredDate: string
  // WorkflowStepEnteredDays: number
}

export interface PgTicket {
  LaborId: string;
  LaborItemName: string;
  // LaborItemStepName: string;
  // LaborItemStepNumber: number;
  // LaborNotes: string | null;
  // ProjectId: string;
  ProjectNumber: string;
  ProjectName: string;
  // WorkOrderId: string;
  WorkOrderNumber: string;
  WorkOrderName: string;
  // WorkOrderStepName: string;
  // WorkOrderStepNumber: number;
  // WaitingOnLaborItem: string | null;
  // NextPlannedLaborItem: string | null;
  // NextMilestoneDate: DateString | null;
  PlannedCriticalDate: DateString;
  // ActualCriticalDate: DateString | null;
  // PrevailingCriticalDate: DateString;
  ShipmentDate: DateString;
  // DeliveryDate: DateString;
  // ProjectManager: string | null;
  // Drafters: string | null;
  // Engineers: string | null;
  // TeamLead: string | null;
  // Assignee: string | null;
  // HideInKiosk: boolean;
  // LaborItemStepDays: number;
  // LaborEstimatedCost: MonetaryValueDto;
  // LaborEstimatedDuration: DurationString;
  // LaborActualCost: MonetaryValueDto;
  // LaborActualDuration: DurationString;
  LaborPlannedDuration: DurationString;
  // LaborPlannedRemainingDuration: DurationString;
  // LaborStepEnteredDate: DateString | null;
  // LaborIsCompletionStep: boolean;
  ActivityLogUsers: string | null;
  // WorkOrderEstimatedCost: MonetaryValueDto;
  // WorkOrderLaborEstimatedDuration: DurationString;
  // WorkOrderGrandTotalPrice: MonetaryValueDto;
  // WorkOrderLaborActualDuration: DurationString;
  // WorkOrderStatus: string;
  // WorkOrderPlannedDuration: DurationString;
  // WorkOrderPlannedRemainingDuration: DurationString;
  // DateCompleted: DateString | null;
}

export const useProdGanttState = defineStore("ProdGanttState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();
  const workflows$ = useWorkflowsState();
  const workWeek$ = useWorkWeekState();
  const nrg = app$.NrgClient ?? new NrgClient();

  const ProductionSchedule = ref<ProductionSchedule | null>(null);

  function parseTimeToHours(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours! + minutes! / 60;
    /* Examples:
      "08:00" = 8
      "14:30" = 14.5
      "09:45" = 9.75
    */
  }

  const DefainProductionSchedule = (): ProductionSchedule => {
    const schedule: ProductionSchedule = {
      WorkWeek: defineWorkWeek(workWeek$?.DefaultWorkWeek || null),
    } as ProductionSchedule;
  };

  const RefreshProjectDtos = async (): Promise<ProjectDto[]> => {
    const key = (config$.Key ?? "").trim();
    const dtos = await nrg.GetProjects(key);

    return dtos;
  };

  const RefreshProjectsAndWorkOrders = async (
    projectNumber: string,
  ): Promise<WorkOrderDto[]> => {
    const key = (config$.Key ?? "").trim();
    const dtos = await nrg.GetWorkOrdersByProjectNumber(key, projectNumber);
    return dtos;
  };

  const getLaborKanbanGridItems = async (): Promise<void> => {
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
      const mergedItems = results.flatMap((result) => result.Tickets || []);

      LaborKanbanGridItems.value = {
        CreateDate: new Date().toISOString(),
        Tickets: mergedItems,
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

  const collatePgProjectsAndWorkOrders = async (): Promise<PgProject[]> => {
    const pgProjects: PgProject[] = [];

    const projectDtos = await RefreshProjectDtos();

    projectDtos.forEach((projDto) => {
      const pgProject: PgProject = {
        Id: projDto.Id,
        Number: projDto.Number || null,
        Name: projDto.Name || null,
        EndDate: new Date(0),
        WOs: [],
      };
      pgProjects.push(pgProject);
    });

    pgProjects.forEach(async (pgProject) => {
      if (!pgProject.Number) return;
      pgProject.WOs = [];

      const workOrderDtos = await RefreshProjectsAndWorkOrders(
        pgProject.Number,
      );
      workOrderDtos.forEach(async (woDto) => {
        const pgWorkOrder: PgWorkOrder = {
          ProjectNumber: woDto.ProjectNumber,
          ProjectName: woDto.ProjectName,
          Id: woDto.Id,
          Number: woDto.Number,
          Name: woDto.Name,
          Type: woDto.Type,
          Status: woDto.Status,
          PgTickets: [],
          PlannedCriticalDate: woDto.PlannedCriticalDate,
        };
        pgProject.WOs.push(pgWorkOrder);

        // Update Project EndDate based on WOs
        if (woDto.PlannedCriticalDate) {
          const woEndDate = new Date(woDto.PlannedCriticalDate);
          if (woEndDate > pgProject.EndDate) {
            pgProject.EndDate = woEndDate;
          }
        }
      });
    });

    return pgProjects;
  };

  const defineWorkWeek = (defaultWorkWeek: WorkWeek | null): WorkDay[] => {
    const workDays: WorkDay[] = [];
    if (defaultWorkWeek) {
      const startHour = parseTimeToHours(defaultWorkWeek.StartOfDay);
      const endHour = startHour + defaultWorkWeek!.HoursPerDay;
      const lengthAsMinutes = defaultWorkWeek!.HoursPerDay * 60;

      const monday = {
        Sequence: 1,
        Name: "Monday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Monday),
      } as WorkDay;
      const tuesday = {
        Sequence: 2,
        Name: "Tuesday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Tuesday,
        ),
      } as WorkDay;
      const wednesday = {
        Sequence: 3,
        Name: "Wednesday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Wednesday,
        ),
      } as WorkDay;
      const thursday = {
        Sequence: 4,
        Name: "Thursday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Thursday,
        ),
      } as WorkDay;
      const friday = {
        Sequence: 5,
        Name: "Friday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Friday),
      } as WorkDay;
      const saturday = {
        Sequence: 6,
        Name: "Saturday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Saturday,
        ),
      } as WorkDay;
      const sunday = {
        Sequence: 7,
        Name: "Sunday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Sunday),
      } as WorkDay;
    }
    return workDays;
  };

  return { ProductionSchedule };
});
