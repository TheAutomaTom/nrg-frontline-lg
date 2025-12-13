import type { WorkflowStepDto } from "./WorkflowStep";

export interface WorkflowConfigDto {
  Id: string;
  Name: string;
  Steps: WorkflowStepDto[];
}
