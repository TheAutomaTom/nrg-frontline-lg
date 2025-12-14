<template>

  <n-space vertical :size="24">

    <n-alert v-if="enabledLaborOptions.length === 0" type="warning" title="No Labor Items">
      Labor items are required to configure workflow steps. Please return to the data refresh page to load projects
      and labor items.
    </n-alert>

    <n-select v-model:value="selectedWorkflowId" :options="workflowOptions" :loading="workflows$.IsLoadingWorkflows"
      placeholder="Choose a workflow" clearable class="third-at-fullscreen" />



    <div v-if="selectedWorkflow">
      <n-card :title="selectedWorkflow.Name" size="small" :bordered="false">
        <template #header-extra>
          <n-space :size="8">
            <n-button size="small" @click="resetWorkflow(selectedWorkflow.Id)">
              Reset
            </n-button>
            <n-button size="small" @click="addStepToWorkflow(selectedWorkflow.Id)">
              + Add Step
            </n-button>
          </n-space>
        </template>
        <n-space vertical :size="12">
          <div v-for="(step, idx) in selectedWorkflowSteps" :key="step.Id" class="step-row">
            <hr />
            <n-flex :size="12" align="center">
              <div style="width: 60px; text-align: center; font-weight: 500;">{{ idx + 1 }}</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <n-button text size="tiny" :disabled="idx === 0"
                  @click="moveStepInWorkflow(selectedWorkflow.Id, idx, 'up')" title="Move up">▲</n-button>
                <n-button text size="tiny" :disabled="idx === selectedWorkflowSteps.length - 1"
                  @click="moveStepInWorkflow(selectedWorkflow.Id, idx, 'down')" title="Move down">▼</n-button>
              </div>
              <n-input v-model:value="step.Name" placeholder="Step name" style="flex: 1; min-width: 200px"
                class="step-name-input" />
              <n-input-number v-model:value="step.TypicalDayCount" placeholder="Days" :min="1" :step="1" :precision="0"
                style="width: 120px" />
              <n-button text type="error" @click="removeStepFromWorkflow(selectedWorkflow.Id, idx)">✕</n-button>
              <n-select v-model:value="step.LaborItems" multiple filterable placeholder="Select labor items"
                :options="enabledLaborOptions" style="min-width: 240px" />
            </n-flex>
          </div>
          <n-text v-if="selectedWorkflowSteps.length === 0" depth="3" class="text-sm italic">
            No steps configured. Click "+ Add Step" to begin.
          </n-text>
        </n-space>
        <n-button type="primary" style="margin-top: 16px;" @click="saveWorkflowSteps(selectedWorkflow.Id)">Save
          Steps</n-button>
      </n-card>
    </div>
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import { useLaborsAndOperationsState } from '@/Data/States/App/ProdGantt/labors-state';
import { generateGuid } from '@/Core/Features/GuidGenerator';
import type { WorkflowDto } from '@/Core/Models/nrg-dtos/WorkflowDto';
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';

const workflows$ = useWorkflowsState();
const labors$ = useLaborsAndOperationsState();
const selectedWorkflowId = ref<string | null>(null);

const workflowOptions = computed(() => {
  if (!workflows$.Workflows) return [];
  return workflows$.Workflows.map((w) => ({
    label: w.Name,
    value: w.Id,
  }));
});

const enabledLaborOptions = computed(() => {
  return labors$.AllEnhancedLabors.filter(l => l.IsEnabled).map(l => ({
    label: l.Name,
    value: l,
  }));
});

const workflowStepsMap = ref<Record<string, WorkflowStep[]>>({});

const selectedWorkflow = computed(() => {
  if (!selectedWorkflowId.value || !workflows$.Workflows) return null;
  return workflows$.Workflows.find((w) => w.Id === selectedWorkflowId.value) ?? null;
});


// Auto-select the workflow if only one is available
import { watch, nextTick } from 'vue';
watch(
  () => workflowOptions.value,
  (opts) => {
    if (opts.length === 1 && !selectedWorkflowId.value) {
      nextTick(() => {
        selectedWorkflowId.value = opts[0].value;
      });
    }
  },
  { immediate: true }
);



// --- Workflow Step Management Functions ---
function addStepToWorkflow(workflowId: string) {
  const steps = workflowStepsMap.value[workflowId] || [];
  steps.push({
    Id: generateGuid(),
    Name: '',
    Sequence: steps.length + 1,
    TypicalDayCount: 1,
    LaborItems: [],
  });
  workflowStepsMap.value[workflowId] = steps;
}

function removeStepFromWorkflow(workflowId: string, idx: number) {
  const steps = workflowStepsMap.value[workflowId] || [];
  steps.splice(idx, 1);
  if (steps.length === 0) {
    steps.push({
      Id: generateGuid(),
      Name: '',
      Sequence: 1,
      TypicalDayCount: 1,
      LaborItems: [],
    });
  }
  workflowStepsMap.value[workflowId] = steps;
}

function moveStepInWorkflow(workflowId: string, idx: number, dir: 'up' | 'down') {
  const steps = workflowStepsMap.value[workflowId] || [];
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= steps.length) return;
  const tmp = steps[idx]!;
  steps[idx] = steps[swapWith]!;
  steps[swapWith] = tmp;
  workflowStepsMap.value[workflowId] = steps;
}

function resetWorkflow(workflowId: string) {
  workflowStepsMap.value[workflowId] = [
    {
      Id: generateGuid(),
      Name: '',
      Sequence: 1,
      TypicalDayCount: 1,
      LaborItems: [],
    },
  ];
}

function saveWorkflowSteps(workflowId: string) {
  const steps = workflowStepsMap.value[workflowId] || [];
  // Re-sequence steps
  steps.forEach((s, i) => (s.Sequence = i + 1));
  workflowStepsMap.value[workflowId] = steps;
  // TODO: Persist to cache or backend
  console.log('Saved workflow steps for', workflowId, steps);
}
</script>

<style scoped>
.flex-columns {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 900px) {
  .flex-columns {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }

  .flex-columns__alert {
    flex: 1 1 auto;
  }

  .third-at-fullscreen {
    width: 33%;
  }
}
</style>
