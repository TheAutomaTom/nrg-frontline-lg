import type { PersonRefDto } from "./PersonRefDto";

export type CurrencyCode = "USD" | string;

export type DurationString = string; // e.g. "3.02:52:22" (days.hours:minutes:seconds) or "HH:MM:SS"

export interface MesLaborGridItemDto {
  LaborId: string;
  LaborItemName: string;
  // LaborItemStepName: string;
  // LaborItemStepNumber: number;
  // LaborNotes: string | null;
  ProjectId: string;
  ProjectNumber: string;
  ProjectName: string;
  WorkOrderId: string;
  WorkOrderNumber: string;
  WorkOrderName: string;
  // WorkOrderStepName: string;
  // WorkOrderStepNumber: number;
  WaitingOnLaborItem: string | null;
  // NextPlannedLaborItem: string | null;
  // NextMilestoneDate: string | null; // ISO date (YYYY-MM-DD)
  PlannedCriticalDate: string | null; // ISO date (YYYY-MM-DD)
  // ActualCriticalDate: string | null; // ISO date (YYYY-MM-DD)
  // PrevailingCriticalDate: string | null; // ISO date (YYYY-MM-DD)
  ShipmentDate: string | null; // ISO date (YYYY-MM-DD)
  DeliveryDate: string | null; // ISO date (YYYY-MM-DD)
  // ProjectManager: PersonRefDto | null;
  // Drafters: PersonRefDto[] | null;
  // Engineers: PersonRefDto[] | null;
  // TeamLead: PersonRefDto | null;
  // Assignee: PersonRefDto | null;
  // HideInKiosk: boolean;
  // LaborItemStepDays: number;
  // LaborEstimatedCost: MoneyValueDto;
  // LaborEstimatedDuration: DurationString;
  // LaborActualCost: MoneyValueDto;
  LaborActualDuration: DurationString;
  LaborPlannedDuration: DurationString;
  // LaborPlannedRemainingDuration: DurationString;
  // LaborStepEnteredDate: string | null; // ISO timestamp
  // LaborIsCompletionStep: boolean;
  ActivityLogUsers: PersonRefDto[] | null;
  // WorkOrderEstimatedCost: MoneyValueDto;
  // WorkOrderLaborEstimatedDuration: DurationString;
  // WorkOrderGrandTotalPrice: MoneyValueDto;
  WorkOrderLaborActualDuration: DurationString;
  WorkOrderStatus: string;
  WorkOrderPlannedDuration: DurationString;
  // WorkOrderPlannedRemainingDuration: DurationString;
  DateCompleted: string | null; // ISO date (YYYY-MM-DD)
}

export interface MesLaborGridResponseDto {
  CreateDate: string; // ISO timestamp
  Items: MesLaborGridItemDto[];
}
