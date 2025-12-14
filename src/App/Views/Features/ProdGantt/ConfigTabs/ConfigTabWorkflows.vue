<template>
  <div class="flex-columns">
    <n-select v-model:value="selectedWorkflowId" :options="workflowOptions" :loading="workflows$.IsLoadingWorkflows"
      placeholder="Choose a workflow" clearable class="third-at-fullscreen" />



  </div>

  <div v-if="showCreate" class="workflow-editor">

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import { generateGuid } from '@/Core/Features/GuidGenerator';
import type { WorkflowDto } from '@/Core/Models/nrg-dtos/WorkflowDto';
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';

const workflows$ = useWorkflowsState();
const selectedWorkflowId = ref<string | null>(null);
const showCreate = ref(false);

const workflowOptions = computed(() => {
  if (!workflows$.Workflows) return [];
  return workflows$.Workflows.map((w) => ({
    label: w.Name,
    value: w.Id,
  }));
});

const selectedWorkflow = computed(() => {
  if (!selectedWorkflowId.value || !workflows$.Workflows) return null;
  return workflows$.Workflows.find((w) => w.Id === selectedWorkflowId.value) ?? null;
});

const newWorkflow = ref<{
  Name: string;
  Steps: Array<WorkflowStep & { Enabled: boolean }>;
}>(
  {
    Name: '',
    Steps: [],
  }
);


function addStep() {
  newWorkflow.value.Steps.push({
    Id: generateGuid(),
    Name: '',
    Sequence: newWorkflow.value.Steps.length + 1,
    TypicalDayCount: 1,
    LaborItems: [],
    Enabled: true,
  });
}

function removeStep(idx: number) {
  newWorkflow.value.Steps.splice(idx, 1);
}

function moveStep(idx: number, dir: 'up' | 'down') {
  const steps = newWorkflow.value.Steps;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= steps.length) return;
  // Defensive: ensure both indices are valid
  if (steps[idx] === undefined || steps[swapWith] === undefined) return;
  const tmp = steps[idx]!;
  steps[idx] = steps[swapWith]!;
  steps[swapWith] = tmp;
}

function saveWorkflow() {
  // Only enabled steps, with correct sequence
  const steps = newWorkflow.value.Steps
    .filter(s => s.Enabled)
    .map((s, i) => ({ ...s, Sequence: i + 1 }));
  // TODO: Save to store or API
  // Example: workflows$.addWorkflow({ ...newWorkflow.value, Steps: steps })
  showCreate.value = false;
  newWorkflow.value.Name = '';
  newWorkflow.value.Steps = [];
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
