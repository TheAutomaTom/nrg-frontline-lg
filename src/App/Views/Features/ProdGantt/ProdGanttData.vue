<template>
  <n-space vertical :size="24">
    <n-alert v-if="!prodGantt$.LaborKanbanGridItems" type="info" title="No Data">
      Click the button below to load production gantt data.
    </n-alert>

    <n-button type="primary" :loading="prodGantt$.IsLoadingTickets" @click="prodGantt$.LoadLaborKanbanGridItems()">
      Load Production Data
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
                <n-card v-for="step in workOrder.steps" :key="step.stepName" size="small" :title="step.stepName">
                  <n-list bordered>
                    <n-list-item v-for="item in step.items" :key="item.LaborId">
                      <template #prefix>
                        <n-tag :bordered="false" type="info">
                          {{ item.LaborItemName || "???" }}
                        </n-tag>
                      </template>
                      <n-space :size="12">
                        <n-text depth="3">Planned: {{ formatDuration(item.LaborPlannedDuration) }}</n-text>
                        <n-text depth="3">Actual: {{ formatDuration(item.WorkOrderLaborActualDuration) }}</n-text>
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
import { useProdGanttState } from '@/Data/States/App/ProdGantt/prod-gantt-state';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import type { TicketDto } from '@/Core/Models/nrg-dtos/ProdGantt/Ticket';
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';
import type { LaborItemDto } from '@/Core/Models/nrg-dtos/LaborItemDto';

const prodGantt$ = useProdGanttState();
const workflows$ = useWorkflowsState();

interface GroupedStep {
  stepName: string;
  sequence: number;
  items: TicketDto[];
}

interface GroupedWorkOrder {
  workOrderKey: string;
  workOrderNumber: string;
  workOrderName: string;
  workOrderStatus: string;
  plannedCriticalDate: string;
  steps: GroupedStep[];
}

interface GroupedProject {
  projectKey: string;
  projectNumber: string;
  projectName: string;
  workOrders: GroupedWorkOrder[];
}

const groupedByProject = computed<GroupedProject[]>(() => {
  if (!prodGantt$.LaborKanbanGridItems?.Items) return [];

  const projectMap = new Map<string, GroupedProject>();

  prodGantt$.LaborKanbanGridItems.Items.forEach(item => {
    const projectKey = `${item.ProjectNumber}`;

    if (!projectMap.has(projectKey)) {
      projectMap.set(projectKey, {
        projectKey,
        projectNumber: item.ProjectNumber,
        projectName: item.ProjectName,
        workOrders: []
      });
    }

    const project = projectMap.get(projectKey)!;
    let workOrder = project.workOrders.find(wo => wo.workOrderNumber === item.WorkOrderNumber);

    if (!workOrder) {
      workOrder = {
        workOrderKey: item.WorkOrderNumber,
        workOrderNumber: item.WorkOrderNumber,
        workOrderName: item.WorkOrderName,
        workOrderStatus: item.WorkOrderStatus,
        plannedCriticalDate: item.PlannedCriticalDate,
        steps: []
      };
      project.workOrders.push(workOrder);
    }

    // Find the workflow step for this labor item
    const workflowSteps = getWorkflowStepsForWorkOrder(item);
    const matchingStep = workflowSteps ? findStepForLaborItem(item, workflowSteps) : null;

    const stepName = matchingStep ? matchingStep.Name : 'Unassigned Labor Items';
    const stepSequence = matchingStep ? matchingStep.Sequence : 9999;

    let step = workOrder.steps.find(s => s.stepName === stepName);
    if (!step) {
      step = {
        stepName,
        sequence: stepSequence,
        items: []
      };
      workOrder.steps.push(step);
    }

    step.items.push(item);
  });

  // Sort steps within each work order by sequence
  projectMap.forEach(project => {
    project.workOrders.forEach(workOrder => {
      workOrder.steps.sort((a, b) => a.sequence - b.sequence);
    });
  });

  return Array.from(projectMap.values());
});

function getWorkflowStepsForWorkOrder(item: TicketDto): WorkflowStep[] | undefined {
  // Find workflow based on work order type and get configured steps
  const workflow = workflows$.Workflows?.find(w =>
    w.Name.toLowerCase().includes(item.WorkOrderStepName.toLowerCase())
  );

  if (workflow && workflows$.WorkflowStepsMap[workflow.Id]) {
    return workflows$.WorkflowStepsMap[workflow.Id];
  }

  return undefined;
}

function findStepForLaborItem(item: TicketDto, workflowSteps: WorkflowStep[]): WorkflowStep | undefined {
  return workflowSteps.find(step =>
    step.LaborItems?.some((labor: LaborItemDto) => labor.Name === item.LaborItemName)
  );
}

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
    const secondsStr = (timeParts[2] || '0').split('.')[0]; // Remove fractional seconds
    seconds = parseInt(secondsStr);
  } else {
    // No days: "08:51:31.2123106" or "08:51:31"
    const timeParts = duration.split(':');
    hours = parseInt(timeParts[0] || '0');
    minutes = parseInt(timeParts[1] || '0');
    const secondsStr = (timeParts[2] || '0').split('.')[0]; // Remove fractional seconds
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

onMounted(() => {
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
