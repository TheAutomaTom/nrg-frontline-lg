import { ref, computed } from "vue";
import { defineStore } from "pinia";

export type PlannerContext = "route" | "labor";

const STORAGE_KEY = "planner-context";

export const usePlannerContextState = defineStore("plannerContextState", () => {
  const Current = ref<PlannerContext>(loadInitial());

  function loadInitial(): PlannerContext {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "route" || v === "labor") return v;
    } catch {}
    return "route";
  }

  const isRoute = computed(() => Current.value === "route");
  const isLabor = computed(() => Current.value === "labor");

  function setContext(ctx: PlannerContext) {
    Current.value = ctx;
    try {
      localStorage.setItem(STORAGE_KEY, ctx);
    } catch {}
  }

  return {
    Current,
    isRoute,
    isLabor,
    setContext,
  };
});
