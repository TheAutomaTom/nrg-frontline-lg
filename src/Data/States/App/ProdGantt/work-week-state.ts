import { defineStore } from "pinia";
import { ref } from "vue";
import { useAppState } from "../app-state";
import { useUserConfigState } from "../user-config-state";
import { WorkWeekCache } from "@/Data/Caches/ProdGantt/WorkWeekCache";
import type { WorkWeek } from "@/Core/Models/ProdGantt/WorkWeek";
import { WeekDay } from "@/Core/Models/ProdGantt/WeekDay";

export const useWorkWeekState = defineStore("WorkWeekState", () => {
  const app$ = useAppState();
  const config$ = useUserConfigState();

  const DefaultWorkWeek = ref<WorkWeek | null>(null);
  const IsLoadingWorkWeek = ref(false);

  const buildDefaultWeek = (): WorkWeek => ({
    HoursPerDay: 8,
    StartOfDay: "08:00",
    WorkingDays: {
      Typical: [
        WeekDay.Monday,
        WeekDay.Tuesday,
        WeekDay.Wednesday,
        WeekDay.Thursday,
        WeekDay.Friday,
      ],
      Overtime: [WeekDay.Saturday, WeekDay.Sunday],
    },
  });

  const loadFromCache = (): boolean => {
    const cached = WorkWeekCache.load();
    if (cached) {
      DefaultWorkWeek.value = cached;
      return true;
    }
    return false;
  };

  const LoadWorkWeek = async (): Promise<void> => {
    app$.showLoading();
    IsLoadingWorkWeek.value = true;
    try {
      if (!loadFromCache()) {
        const week = buildDefaultWeek();
        DefaultWorkWeek.value = week;
        WorkWeekCache.save(week);
        app$.setAppStatus("success", "Default work week initialized.");
      } else {
        app$.setAppStatus("success", "Work week loaded from cache.");
      }
    } catch (err) {
      app$.setAppStatus(
        "error",
        `Failed to load work week: ${(err as Error)?.message || err}`,
      );
    } finally {
      IsLoadingWorkWeek.value = false;
      app$.hideLoading();
    }
  };

  const SaveWorkWeek = (week: WorkWeek): void => {
    try {
      DefaultWorkWeek.value = week;
      WorkWeekCache.save(week);
      app$.setAppStatus("success", "Work week saved.");
    } catch (err) {
      app$.setAppStatus(
        "error",
        `Failed to save work week: ${(err as Error)?.message || err}`,
      );
    }
  };

  const ResetWorkWeek = (): void => {
    const week = buildDefaultWeek();
    SaveWorkWeek(week);
  };

  // Init on store creation
  loadFromCache();

  return {
    DefaultWorkWeek,
    IsLoadingWorkWeek,
    LoadWorkWeek,
    SaveWorkWeek,
    ResetWorkWeek,
  };
});
