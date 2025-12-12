import { createRouter, createWebHistory } from "vue-router";
import { useAppState } from "@/Data/States/App/app-state";
import DataRefresh from "@/App/Views/Home/DataRefresh.vue";
import DataBackup from "@/App/Views/Home/DataBackup.vue";
// TODO: Create missing PlannedLaborImporter components
// import PliTestPage from "@/App/Views/Features/PlannedLaborImporter/PliTestPage.vue";
// import PliConfigLabors from "@/App/Views/Features/PlannedLaborImporter/PliConfig/PliConfigLabors.vue";
// import PliProjectPicker from "@/App/Views/Features/PlannedLaborImporter/PliConfig/PliProjectPicker.vue";
// import PliLaborImporter from "../Views/Features/PlannedLaborImporter/PliLaborImporter.vue";
// import PliHelpPage from "../Views/Features/PlannedLaborImporter/PliHelpPage.vue";
// import PliOpsTestPage from "../Views/Features/PlannedLaborImporter/PliOpsTestPage.vue";
// TODO: Create missing ProjectPak components
// import ProjectPakMaterialReportParser from "../Views/Features/ProjectPak/MaterialReportParser/ProjectPakMaterialReportParser.vue";

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
  // TODO: Add PlannedLaborImporter and ProjectPak routes when components are created
  // {
  //   path: "/pli-test-page",
  //   name: "pli-test-page",
  //   component: PliTestPage,
  // },
  // {
  //   path: "/pli-config-labors",
  //   name: "pli-config-labors",
  //   component: PliConfigLabors,
  // },
  // {
  //   path: "/pli-project-picker",
  //   name: "pli-project-picker",
  //   component: PliProjectPicker,
  // },
  // {
  //   path: "/pli-labor-importer",
  //   name: "pli-labor-importer",
  //   component: PliLaborImporter,
  // },
  // {
  //   path: "/help/planned-labor-import",
  //   name: "help-planned-labor-import",
  //   component: PliHelpPage,
  // },
  // {
  //   path: "/pli-operations-test",
  //   name: "pli-operations-test",
  //   component: PliOpsTestPage,
  // },
  // {
  //   path: "/project-pak-material-report-parser",
  //   name: "project-pak-material-report-parser",
  //   component: ProjectPakMaterialReportParser,
  // },
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
