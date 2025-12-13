import { WeekDay } from "./WeekDay";

export interface WorkWeek {
  HoursPerDay: number; // double
  StartOfDay: string; // Time format (e.g., "08:00")
  WorkingDays: {
    Typical: WeekDay[];
    Overtime: WeekDay[];
  };
}
