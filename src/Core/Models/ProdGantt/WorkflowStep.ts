import type { LaborItemDto } from "../nrg-dtos/LaborItemDto";

export interface WorkflowStepDto {
  Id: string; // Frontline GUID
  Name: string;
  Sequence: number; // Order in which steps occur
  LaborItems: LaborItemDto[]; // Items that can only occur in this step
}
