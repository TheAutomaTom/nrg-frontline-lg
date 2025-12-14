import type { WorkflowStep } from "./WorkflowStep";
import type { WorkWeek } from "./WorkWeek";

export interface WorkflowConfig {
  Id: string;
  Name: string;
  Steps: WorkflowStep[];
  WorkWeek: WorkWeek;
}
