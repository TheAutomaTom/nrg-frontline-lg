<template>
  <n-space vertical :size="24">
    <n-alert v-if="prodGantt$.SelectedProjectNumbers.length === 0" type="warning" title="No Projects Selected">
      Please go to the "Project Picker" tab and select projects before loading production data.
    </n-alert>

    <n-alert v-else-if="!prodGantt$.LaborKanbanGridItems" type="info" title="No Data">
      Click the button below to load production gantt data for the selected {{ prodGantt$.SelectedProjectNumbers.length
      }} project(s).
    </n-alert>

    <n-button type="primary" :loading="prodGantt$.IsLoadingTickets"
      :disabled="prodGantt$.SelectedProjectNumbers.length === 0" @click="prodGantt$.LoadLaborKanbanGridItems()">
      Load Production Data ({{ prodGantt$.SelectedProjectNumbers.length }} projects)
    </n-button>

    <div v-if="prodGantt$.LaborKanbanGridItems">
      <n-collapse>
        <n-collapse-item v-for="project in groupedByProject" :key="project.projectKey"
          :title="`${project.projectName} (${project.projectNumber})`">
          <n-collapse>
            <n-collapse-item v-for="workOrder in project.workOrders" :key="workOrder.workOrderKey"
              :title="getWorkOrderTitle(workOrder)">

              <!-- Workflow Steps -->
              <n-space vertical :size="16">
                <n-card v-for="step in workOrder.steps" :key="step.stepName" size="small">
                  <template #header>
                    <n-space vertical :size="4">
                      <n-text strong>{{ step.stepName }}</n-text>
                      <n-text v-if="step.stepStartDate && step.stepEndDate" depth="3" style="font-size: 12px;">
                        Step Window: {{ formatDateTime(step.stepStartDate) }} → {{ formatDateTime(step.stepEndDate) }}
                      </n-text>
                    </n-space>
                  </template>

                  <n-list bordered>
                    <n-list-item v-for="schedItem in step.schedules" :key="schedItem.laborItem.LaborId">
                      <template #prefix>
                        <n-tag :bordered="false" type="info">
                          {{ schedItem.laborItem.LaborItemName || "???" }}
                        </n-tag>
                      </template>
                      <n-space vertical :size="4">
                        <n-space :size="12">
                          <n-text depth="3">Duration: {{ formatDuration(schedItem.laborItem.LaborPlannedDuration)
                          }}</n-text>
                          <n-text depth="3">Actual: {{ formatDuration(schedItem.laborItem.WorkOrderLaborActualDuration)
                          }}</n-text>
                        </n-space>
                        <n-space :size="8">
                          <n-tag size="small" type="success">
                            Start: {{ formatDateTime(schedItem.startDate) }}
                          </n-tag>
                          <n-tag size="small" type="error">
                            End: {{ formatDateTime(schedItem.endDate) }}
                          </n-tag>
                        </n-space>
                      </n-space>
                    </n-list-item>
                  </n-list>
                </n-card>
              </n-space>

            </n-collapse-item>
          </n-collapse>
        </n-collapse-item>
      </n-collapse>
    </div>
  </n-space>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProdGanttState, type GroupedWorkOrder } from '@/Data/States/App/ProdGantt/prod-gantt-state';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import { useWorkWeekState } from '@/Data/States/App/ProdGantt/work-week-state';

const prodGantt$ = useProdGanttState();
const workflows$ = useWorkflowsState();
const workWeek$ = useWorkWeekState();

// Use the computed property from the state
const groupedByProject = computed(() => prodGantt$.GroupedProjectsWithSchedule);

function getWorkOrderTitle(workOrder: GroupedWorkOrder): string {
  return `${workOrder.workOrderName} (${workOrder.workOrderNumber}) - ${workOrder.workOrderStatus} - Due: ${workOrder.plannedCriticalDate}`;
}

function formatDuration(duration: string | null): string {
  if (!duration) return 'N/A';

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Parse duration like "08:51:31.2123106" (HH:mm:ss.fffffff) or "3.06:11:59.2932333" (d.HH:mm:ss.fffffff)

  // Check for days format: d.HH:mm:ss (day comes before first colon)
  const firstColonIndex = duration.indexOf(':');
  const firstDotIndex = duration.indexOf('.');

  if (firstDotIndex !== -1 && firstDotIndex < firstColonIndex) {
    // Has days: "3.06:11:59.2932333"
    days = parseInt(duration.substring(0, firstDotIndex));
    const afterDays = duration.substring(firstDotIndex + 1);
    const timeParts = afterDays.split(':');
    hours = parseInt(timeParts[0] || '0');
    minutes = parseInt(timeParts[1] || '0');
    const secondsStr = (timeParts[2] || '0').split('.')[0] || '0'; // Remove fractional seconds
    seconds = parseInt(secondsStr);
  } else {
    // No days: "08:51:31.2123106" or "08:51:31"
    const timeParts = duration.split(':');
    hours = parseInt(timeParts[0] || '0');
    minutes = parseInt(timeParts[1] || '0');
    const secondsStr = (timeParts[2] || '0').split('.')[0] || '0'; // Remove fractional seconds
    seconds = parseInt(secondsStr);
  }

  // Convert everything to total minutes
  let totalMinutes = days * 24 * 60 + hours * 60 + minutes;

  // Round up if there are any seconds
  if (seconds > 0) {
    totalMinutes += 1;
  }

  // Convert back to hours and minutes
  const finalHours = Math.floor(totalMinutes / 60);
  const finalMinutes = totalMinutes % 60;

  return `${finalHours}h ${finalMinutes}m`;
}

function formatDateTime(date: Date | null): string {
  if (!date) return 'N/A';

  try {
    // Format as "Dec 16, 2025 14:30" (military time)
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Military time
    });

    return `${dateStr} ${timeStr}`;
  } catch {
    return date.toString();
  }
}

onMounted(() => {
  // Load work week configuration
  if (!workWeek$.DefaultWorkWeek) {
    workWeek$.LoadWorkWeek();
  }

  // Load workflows first if not already loaded
  if (!workflows$.Workflows) {
    workflows$.LoadWorkflows();
  }

  // Load production data
  if (!prodGantt$.LaborKanbanGridItems) {
    prodGantt$.LoadLaborKanbanGridItems();
  }
});
</script>
