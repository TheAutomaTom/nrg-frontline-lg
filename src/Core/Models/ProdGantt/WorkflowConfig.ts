import type { WorkflowStep } from "./WorkflowStep";

export interface WorkflowConfig {
  Id: string;
  Name: string;
  Steps: WorkflowStep[];
}
