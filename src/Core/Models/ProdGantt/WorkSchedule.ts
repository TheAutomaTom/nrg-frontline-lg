import type { WorkDays } from "./WorkDays";

export interface WorkSchedule {
  HoursPerDay: number; // double
  StartOfDay: string; // Time format (e.g., "08:00")
  WorkingDays: WorkDays;
}
