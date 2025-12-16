<template>
  <n-space vertical :size="24">
    <div class="project-controls">
      <n-space align="center">
        <n-button type="primary" @click="workflows$.LoadProjectsWithWorkOrders()"
          :loading="workflows$.IsLoadingProjects">
          Load Projects
        </n-button>
        
        <n-input 
          v-model:value="searchQuery" 
          placeholder="Search projects..." 
          clearable
          style="width: 250px;"
        >
          <template #prefix>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0c.41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"/></svg>
            </n-icon>
          </template>
        </n-input>

        <n-divider vertical />

        <n-text>Filter Critical Date through:</n-text>
        <n-date-picker v-model:value="filterDateValue" type="date" placeholder="Select End Date" clearable
          :is-date-disabled="isDateDisabled" @update:value="onDateChange" style="width: 200px;" />

        <n-tag v-if="filterDateValue" type="info" closable @close="clearFilter">
          {{ formatFilterDateRange() }}
        </n-tag>

        <n-divider vertical />

        <n-button-group>
          <n-button @click="selectAll" size="small">Select All</n-button>
          <n-button @click="deselectAll" size="small">Deselect All</n-button>
        </n-button-group>

        <n-button type="success" @click="saveSelectedProjects" :disabled="selectedCount === 0">
          Save Selected ({{ selectedCount }})
        </n-button>
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
        <n-card v-for="pww in searchFilteredProjects" :key="pww.project.Id" size="small" hoverable>
          <template #header>
            <n-space align="center" justify="space-between">
              <n-space align="center">
                <n-checkbox :checked="selectedProjects.has(pww.project.Number ?? '')"
                  @update:checked="() => toggleProjectSelection(pww.project.Number ?? '')" />
                <div>
                  <n-text strong>{{ pww.project.Number }}</n-text>
                  <n-text style="margin-left: 12px;">{{ pww.project.Name }}</n-text>
                </div>
              </n-space>
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
import { ref, computed, onMounted } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import { useProdGanttState } from '@/Data/States/App/ProdGantt/prod-gantt-state';

const workflows$ = useWorkflowsState();
const prodGantt$ = useProdGanttState();

// Local state for checkboxes (stores project numbers)
const selectedProjects = ref<Set<string>>(new Set());

// Date picker value (timestamp in milliseconds)
const filterDateValue = ref<number | null>(null);

// Search query for filtering projects
const searchQuery = ref('');

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

const toggleProjectSelection = (projectNumber: string): void => {
  if (selectedProjects.value.has(projectNumber)) {
    selectedProjects.value.delete(projectNumber);
  } else {
    selectedProjects.value.add(projectNumber);
  }
};

const saveSelectedProjects = (): void => {
  const projectNumbers = Array.from(selectedProjects.value);
  prodGantt$.SaveSelectedProjects(projectNumbers);
};

const selectAll = (): void => {
  searchFilteredProjects.value.forEach(pww => {
    if (pww.project.Number) {
      selectedProjects.value.add(pww.project.Number);
    }
  });
};

const deselectAll = (): void => {
  selectedProjects.value.clear();
};

const selectedCount = computed(() => selectedProjects.value.size);

// Filter projects by search query (number or name)
const searchFilteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    return workflows$.FilteredProjectsWithWorkOrders;
  }
  
  return workflows$.FilteredProjectsWithWorkOrders.filter(pww => {
    const number = pww.project.Number?.toLowerCase() || '';
    const name = pww.project.Name?.toLowerCase() || '';
    return number.includes(query) || name.includes(query);
  });
});

onMounted(async () => {
  // Auto-load if no data exists
  if (workflows$.Projects.length === 0) {
    await workflows$.LoadProjectsWithWorkOrders();
  }

  // Load previously selected project numbers
  prodGantt$.SelectedProjectNumbers.forEach(number => {
    selectedProjects.value.add(number);
  });
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
