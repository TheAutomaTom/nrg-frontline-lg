import type { MonetaryValueDto } from "../Project/MonetaryValueDto";

// TimeSpan duration from .NET, formatted as "HH:mm:ss.fffffff" or "d.HH:mm:ss.fffffff"
// Example: "08:51:31.2123106" = 8 hours, 51 minutes, 31 seconds
// Example: "3.06:11:59.2932333" = 3 days, 6 hours, 11 minutes, 59 seconds
export type DurationString = string;

// Date string in ISO format "YYYY-MM-DD"
// Example: "2025-12-16"
export type DateString = string;

export interface LaborKanbanGridItemsDto {
  CreateDate: string;
  Tickets: TicketDto[];
}

export interface TicketDto {
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
  WorkOrderStepName: string;
  WorkOrderStepNumber: number;
  // WaitingOnLaborItem: string | null;
  // NextPlannedLaborItem: string | null;
  // NextMilestoneDate: DateString | null;
  PlannedCriticalDate: DateString;
  // ActualCriticalDate: DateString | null;
  // PrevailingCriticalDate: DateString;
  ShipmentDate: DateString;
  DeliveryDate: DateString;
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
  LaborPlannedRemainingDuration: DurationString;
  // LaborStepEnteredDate: DateString | null;
  LaborIsCompletionStep: boolean;
  ActivityLogUsers: string | null;
  WorkOrderEstimatedCost: MonetaryValueDto;
  WorkOrderLaborEstimatedDuration: DurationString;
  WorkOrderGrandTotalPrice: MonetaryValueDto;
  WorkOrderLaborActualDuration: DurationString;
  WorkOrderStatus: string;
  WorkOrderPlannedDuration: DurationString;
  WorkOrderPlannedRemainingDuration: DurationString;
  DateCompleted: DateString | null;
}
