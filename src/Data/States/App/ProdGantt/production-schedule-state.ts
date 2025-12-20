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
import { useProjectPickerState } from "./project-picker-state";

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
  const projectPicker$ = useProjectPickerState();
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

  const DefineProductionSchedule = (): ProductionSchedule => {
    const schedule: ProductionSchedule = {
      WorkWeek: defineWorkWeek(workWeek$?.DefaultWorkWeek || null),
    } as ProductionSchedule;

    //
    //
    // return schedule;
  };

  const refreshProjectWorkOrders = async (
    projectNumber: string,
  ): Promise<WorkOrderDto[]> => {
    const key = (config$.Key ?? "").trim();
    const dtos = await nrg.GetWorkOrdersByProjectNumber(key, projectNumber);
    return dtos;
  };

  //============================================

  const findUniqueProjectNumbers = (tickets: TicketDto[]): PgProject[] => {
    const seen = new Set<string>();
    return tickets
      .filter((ticket) => {
        if (!ticket.ProjectNumber) return false; // guard if nullable
        if (seen.has(ticket.ProjectNumber)) return false;
        seen.add(ticket.ProjectNumber);
        return true;
      })
      .map((dto) => ({
        Id: dto.ProjectId,
        Number: dto.ProjectNumber ?? null,
        Name: dto.ProjectName ?? null,
        EndDate: new Date(), // TODO: set to latest PlannedCriticalDate
        WOs: [],
      }));
  };

  const createProjectsWithWorkOrdersAndTickets = (
    tickets: TicketDto[],
  ): PgProject[] => {
    const projectMap = new Map<string, PgProject>();

    tickets.forEach((ticket) => {
      if (!ticket.ProjectNumber) return;

      // Get or create project
      let project = projectMap.get(ticket.ProjectNumber);
      if (!project) {
        project = {
          Id: ticket.ProjectId,
          Number: ticket.ProjectNumber,
          Name: ticket.ProjectName ?? null,
          EndDate: new Date(ticket.PlannedCriticalDate), // Use the ticket's critical date as initial
          WOs: [],
        };
        projectMap.set(ticket.ProjectNumber, project);
      }

      // Update project end date to the latest critical date
      const ticketCriticalDate = new Date(ticket.PlannedCriticalDate);
      if (ticketCriticalDate > project.EndDate) {
        project.EndDate = ticketCriticalDate;
      }

      // Get or create work order within this project
      let workOrder = project.WOs.find(
        (wo) => wo.Number === ticket.WorkOrderNumber,
      );
      if (!workOrder) {
        workOrder = {
          PgTickets: [],
          PlannedCriticalDate: ticket.PlannedCriticalDate,
          ProjectNumber: ticket.ProjectNumber,
          ProjectName: ticket.ProjectName ?? "",
          Id: ticket.WorkOrderId,
          Number: ticket.WorkOrderNumber,
          Name: ticket.WorkOrderName,
          Type: "", // TODO: populate from separate WorkOrderDtos call
          Status: "", // TODO: populate from separate WorkOrderDtos call
        };
        project.WOs.push(workOrder);
      }

      // Create PgTicket from TicketDto
      const pgTicket: PgTicket = {
        LaborId: ticket.LaborId,
        LaborItemName: ticket.LaborItemName,
        ProjectNumber: ticket.ProjectNumber,
        ProjectName: ticket.ProjectName ?? "",
        WorkOrderNumber: ticket.WorkOrderNumber,
        WorkOrderName: ticket.WorkOrderName,
        PlannedCriticalDate: ticket.PlannedCriticalDate,
        ShipmentDate: ticket.ShipmentDate,
        LaborPlannedDuration: ticket.LaborPlannedDuration,
        ActivityLogUsers: ticket.ActivityLogUsers,
      };

      workOrder.PgTickets.push(pgTicket);
    });

    return Array.from(projectMap.values());
  };

  //============================================

  const collatePgProjectsAndWorkOrdersandLabor = async (): Promise<
    PgProject[]
  > => {
    // Get all tickets for selected projects
    const allTickets: TicketDto[] = [];

    for (const projNum of projectPicker$.SelectedProjectNumbers) {
      const ticketDtos =
        await nrg.GetLaborKanbanGridItemsByProjectNumber(projNum);
      if (ticketDtos.Tickets) {
        allTickets.push(...ticketDtos.Tickets);
      }
    }
    // Use the helper function to create projects with work orders and tickets
    return createProjectsWithWorkOrdersAndTickets(allTickets);
  };

  const getLaborKanbanGridItems =
    async (): Promise<LaborKanbanGridItemsDto | null> => {
      const key = (config$.Key ?? "").trim();
      if (!key) {
        app$.setAppStatus(
          "error",
          "Missing API key for labor kanban grid items.",
        );
        return null;
      }

      // Check if we have selected projects
      if (projectPicker$.SelectedProjectNumbers.length === 0) {
        app$.setAppStatus(
          "error",
          "No projects selected. Please select projects first.",
        );
        return null;
      }

      app$.showLoading();
      // IsLoadingTickets.value = true;
      nrg.SetKey(key);

      try {
        console.log(
          `[ProdGanttState] Loading data for ${projectPicker$.SelectedProjectNumbers.length} selected projects...`,
        );

        // Load data for each selected project individually
        const promises = projectPicker$.SelectedProjectNumbers.map(
          (projectNumber) =>
            nrg.GetLaborKanbanGridItemsByProjectNumber(projectNumber),
        );

        const results = await Promise.all(promises);

        // Merge all results into a single LaborKanbanGridItemsDto
        const mergedItems = results.flatMap((result) => result.Tickets || []);

        const LaborKanbanGridItems = {
          CreateDate: new Date().toISOString(),
          Tickets: mergedItems,
        } as LaborKanbanGridItemsDto;

        app$.setAppStatus(
          "success",
          `Loaded ${mergedItems.length} labor items from ${projectPicker$.SelectedProjectNumbers.length} project(s).`,
        );
        return LaborKanbanGridItems;
      } catch (err) {
        const message =
          (err as Error)?.message ||
          (typeof err === "string" ? err : "Unknown error");
        app$.setAppStatus(
          "error",
          `Labor kanban grid items failed: ${message}`,
        );
      } finally {
        // IsLoadingTickets.value = false;
        app$.hideLoading();
      }
      return null;
    };

  const defineWorkWeek = (defaultWorkWeek: WorkWeek | null): WorkDay[] => {
    if (!defaultWorkWeek) return [];

    const startHour = parseTimeToHours(defaultWorkWeek.StartOfDay);
    const endHour = startHour + defaultWorkWeek!.HoursPerDay;
    const lengthAsMinutes = defaultWorkWeek!.HoursPerDay * 60;

    const workDays: WorkDay[] = [
      {
        Sequence: 1,
        Name: "Monday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Monday),
      } as WorkDay,
      {
        Sequence: 2,
        Name: "Tuesday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Tuesday,
        ),
      } as WorkDay,
      {
        Sequence: 3,
        Name: "Wednesday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Wednesday,
        ),
      } as WorkDay,
      {
        Sequence: 4,
        Name: "Thursday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Thursday,
        ),
      } as WorkDay,
      {
        Sequence: 5,
        Name: "Friday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Friday),
      } as WorkDay,
      {
        Sequence: 6,
        Name: "Saturday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(
          WeekDay.Saturday,
        ),
      } as WorkDay,
      {
        Sequence: 7,
        Name: "Sunday",
        StartHour: startHour,
        EndHour: endHour,
        LengthAsMinutes: lengthAsMinutes,
        IsEnabled: defaultWorkWeek.WorkingDays.Typical.includes(WeekDay.Sunday),
      } as WorkDay,
    ];

    return workDays;
  };

  //=====================================================================
  return {
    ProductionSchedule,
    getProjectsWithWorkOrders: createProjectsWithWorkOrdersAndTickets,
    collatePgProjectsAndWorkOrdersandLabor,
  };
});
