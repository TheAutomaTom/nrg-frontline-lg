<template>
  <n-space vertical :size="24">
    <div class="project-controls">
      <n-space align="center">
        <n-button type="primary" @click="workflows$.LoadProjectsWithWorkOrders()"
          :loading="workflows$.IsLoadingProjects">
          Load Projects
        </n-button>

        <n-divider vertical />

        <n-text>Filter Critical Date through:</n-text>
        <n-date-picker v-model:value="filterDateValue" type="date" placeholder="Select End Date" clearable
          :is-date-disabled="isDateDisabled" @update:value="onDateChange" style="width: 200px;" />

        <n-tag v-if="filterDateValue" type="info" closable @close="clearFilter">
          {{ formatFilterDateRange() }}
        </n-tag>
      </n-space>
    </div>

    <n-alert v-if="workflows$.Projects.length === 0 && !workflows$.IsLoadingProjects" type="info">
      No projects loaded. Click "Load Projects" to fetch projects and work orders from the server.
    </n-alert>

    <n-alert v-else-if="workflows$.FilteredProjectsWithWorkOrders.length === 0 && workflows$.Projects.length > 0"
      type="warning">
      No projects found with open work orders matching the selected date range.
      {{ filterDateValue ? 'Try adjusting the date filter.' : 'Click "Load Projects" to refresh.' }}
    </n-alert>

    <template v-else>
      <n-space vertical>
        <n-card v-for="pww in workflows$.FilteredProjectsWithWorkOrders" :key="pww.project.Id" size="small" hoverable>
          <template #header>
            <n-space align="center" justify="space-between">
              <div>
                <n-text strong>{{ pww.project.Number }}</n-text>
                <n-text style="margin-left: 12px;">{{ pww.project.Name }}</n-text>
              </div>
              <n-tag type="success" size="small">
                {{ pww.workOrders.length }} Work Order{{ pww.workOrders.length !== 1 ? 's' : '' }}
              </n-tag>
            </n-space>
          </template>

          <n-list bordered>
            <n-list-item v-for="wo in pww.workOrders" :key="wo.Id">
              <template #prefix>
                <n-tag size="small" :type="getWorkOrderTypeColor(wo.Type)">
                  {{ wo.Type }}
                </n-tag>
              </template>

              <n-space vertical :size="4">
                <div>
                  <n-text strong>{{ wo.Number }}</n-text>
                  <n-text style="margin-left: 8px;">{{ wo.Name }}</n-text>
                </div>

                <n-space size="small">
                  <n-tag size="tiny" type="default">
                    Status: {{ wo.Status }}
                  </n-tag>

                  <n-tag size="tiny" type="default">
                    Step: {{ wo.Step }}
                  </n-tag>

                  <n-tag v-if="wo.PlannedCriticalDate" size="tiny" type="error">
                    Critical: {{ formatDate(wo.PlannedCriticalDate) }}
                  </n-tag>

                  <n-tag v-if="wo.PlannedStartDate" size="tiny" type="info">
                    Start: {{ formatDate(wo.PlannedStartDate) }}
                  </n-tag>
                </n-space>

                <n-text v-if="wo.ProjectManager" depth="3" style="font-size: 12px;">
                  PM: {{ wo.ProjectManager.FullName }}
                </n-text>
              </n-space>
            </n-list-item>
          </n-list>
        </n-card>
      </n-space>
    </template>
  </n-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';

const workflows$ = useWorkflowsState();

// Date picker value (timestamp in milliseconds)
const filterDateValue = ref<number | null>(null);

// Disable past dates
const isDateDisabled = (ts: number): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return ts < today.getTime();
};

const onDateChange = (value: number | null): void => {
  if (value === null) {
    workflows$.SetFilterEndDate(null);
  } else {
    workflows$.SetFilterEndDate(new Date(value));
  }
};

const clearFilter = (): void => {
  filterDateValue.value = null;
  workflows$.SetFilterEndDate(null);
};

const formatFilterDateRange = (): string => {
  if (!filterDateValue.value) return '';
  const now = new Date();
  const end = new Date(filterDateValue.value);
  return `${formatDate(now.toISOString())} - ${formatDate(end.toISOString())}`;
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const getWorkOrderTypeColor = (type: string): 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' => {
  const typeMap: Record<string, 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'> = {
    'Drafting': 'info',
    'Production': 'warning',
    'Installation': 'success',
  };
  return typeMap[type] || 'default';
};

onMounted(async () => {
  // Auto-load if no data exists
  if (workflows$.Projects.length === 0) {
    await workflows$.LoadProjectsWithWorkOrders();
  }
});
</script>

<style scoped>
.project-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: var(--n-color);
  border-radius: 6px;
}

:deep(.n-list-item__prefix) {
  margin-right: 12px;
}
</style>
