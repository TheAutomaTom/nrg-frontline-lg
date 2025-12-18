import { defineStore } from "pinia";
import { ref } from "vue";
import { SelectedProjectsCache } from "@/Data/Caches/ProdGantt/SelectedProjectsCache";

export const useProjectPickerState = defineStore("ProjectPickerState", () => {
  // Selected Projects State (stores project numbers, not IDs)
  const SelectedProjectNumbers = ref<string[]>([]);

  const LoadSelectedProjects = (): void => {
    const cached = SelectedProjectsCache.load();
    if (cached) {
      SelectedProjectNumbers.value = cached;
      console.log(
        `[ProjectPickerState] Loaded ${cached.length} selected project numbers from cache`,
      );
    }
  };

  const SaveSelectedProjects = (projectNumbers: string[]): void => {
    SelectedProjectNumbers.value = projectNumbers;
    SelectedProjectsCache.save(projectNumbers);
    console.log(
      `[ProjectPickerState] Saved ${projectNumbers.length} selected project numbers`,
    );
  };

  const ToggleProjectSelection = (projectNumber: string): void => {
    const index = SelectedProjectNumbers.value.indexOf(projectNumber);
    if (index > -1) {
      SelectedProjectNumbers.value.splice(index, 1);
    } else {
      SelectedProjectNumbers.value.push(projectNumber);
    }
    SelectedProjectsCache.save(SelectedProjectNumbers.value);
  };

  const ClearSelectedProjects = (): void => {
    SelectedProjectNumbers.value = [];
    SelectedProjectsCache.clear();
  };

  // Load cached selected projects on initialization
  LoadSelectedProjects();

  return {
    SelectedProjectNumbers,
    SaveSelectedProjects,
    ToggleProjectSelection,
    ClearSelectedProjects,
    LoadSelectedProjects,
  };
});
