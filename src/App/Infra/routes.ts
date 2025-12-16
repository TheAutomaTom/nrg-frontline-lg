import { createRouter, createWebHistory } from "vue-router";
import { useAppState } from "@/Data/States/App/app-state";
import DataRefresh from "@/App/Views/Home/DataRefresh.vue";
import DataBackup from "@/App/Views/Home/DataBackup.vue";
import ConfigureProdGantt from "@/App/Views/Features/ProdGantt/ConfigureProdGantt.vue";
import ProdGanttData from "@/App/Views/Features/ProdGantt/ProdGanttData.vue";
import ConfigTabProjectPicker from "@/App/Views/Features/ProdGantt/ConfigTabs/ConfigTabProjectPicker.vue";

const routes = [
  {
    path: "/",
    name: "data-refresh",
    component: DataRefresh,
  },
  {
    path: "/data-backup",
    name: "data-backup",
    component: DataBackup,
  },
  {
    path: "/pg-config",
    name: "pg-config",
    component: ConfigureProdGantt,
  },
  {
    path: "/pg-project-picker",
    name: "pg-project-picker",
    component: ConfigTabProjectPicker,
  },
  {
    path: "/pg-prod-gantt-data",
    name: "pg-prod-gantt-data",
    component: ProdGanttData,
  },
];

export const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const app$ = useAppState();
  app$.showLoading();

  // Allow help pages and home page to load without redirect
  if (
    to.name === "data-refresh" ||
    (to.name && typeof to.name === "string" && to.name.startsWith("help-"))
  ) {
    next();
  } else {
    // For other routes on fresh page load, redirect to home
    if (from.name === null || from.name === undefined) {
      next({ name: "data-refresh" });
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  const app$ = useAppState();
  // Small delay to bridge the gap between navigation end and component mount
  setTimeout(() => {
    app$.hideLoading();
  }, 50);
});
