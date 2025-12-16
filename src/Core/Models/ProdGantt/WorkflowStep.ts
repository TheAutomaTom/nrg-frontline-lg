import type { LaborItemDto } from "../nrg-dtos/LaborItemDto";

// Defined by user; api does not provide.
export interface WorkflowStep {
  Id: string; // Frontline GUID
  Name: string;
  WorkOrderType: "Drafting" | "Production" | "Installation";
  Sequence: number; // Resets per WorkOrderType
  TypicalDayCount: number;
  LaborItems: LaborItemDto[]; // Items that can only occur in this step
}
