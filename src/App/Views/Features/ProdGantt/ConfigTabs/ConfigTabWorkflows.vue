<template>
  <div class="workflow-selector">
    <n-select v-model:value="selectedWorkflowId" :options="workflowOptions" :loading="workflows$.IsLoadingWorkflows"
      placeholder="Choose a workflow" clearable class="workflow-selector__select" />

    <n-button type="primary" @click="showCreate = !showCreate" style="margin-left: 12px;">
      {{ showCreate ? 'Cancel' : 'Create New Workflow' }}
    </n-button>

    <n-alert type="info" class="text-sm workflow-selector__alert">
      This tool requires manually configuring workflow steps.
    </n-alert>
  </div>

  <div v-if="showCreate" class="workflow-create">
    <div class="workflow-create__row">
      <label>Name:</label>
      <n-input v-model:value="newWorkflow.Name" placeholder="Workflow Name" style="width: 240px;" />
    </div>
    <div class="workflow-create__row">
      <label>Steps:</label>
      <n-button size="small" @click="addStep" style="margin-left: 8px;">Add Step</n-button>
    </div>
    <div class="workflow-steps-list">
      <div v-for="(step, idx) in newWorkflow.Steps" :key="step.Id" class="workflow-step-row">
        <n-button size="small" quaternary :disabled="idx === 0" @click="moveStep(idx, 'up')">▲</n-button>
        <n-button size="small" quaternary :disabled="idx === newWorkflow.Steps.length - 1"
          @click="moveStep(idx, 'down')">▼</n-button>
        <n-switch v-model:value="step.Enabled" style="margin: 0 8px;" />
        <n-input v-model:value="step.Name" placeholder="Step Name" style="width: 140px; margin-right: 8px;" />
        <n-input-number v-model:value="step.TypicalDayCount" :min="1" style="width: 80px; margin-right: 8px;" />
        <span style="color: #888; font-size: 12px;">Days</span>
        <n-button size="small" quaternary @click="removeStep(idx)" style="margin-left: 8px;">Remove</n-button>
      </div>
    </div>
    <div class="workflow-create__row">
      <n-button type="primary" @click="saveWorkflow">Save Workflow</n-button>
    </div>
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
.workflow-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-create {
  margin-top: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
  max-width: 700px;
}

.workflow-create__row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.workflow-steps-list {
  margin-left: 16px;
  margin-bottom: 16px;
}

.workflow-step-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

@media (min-width: 900px) {
  .workflow-selector {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }

  .workflow-selector__alert {
    flex: 1 1 auto;
  }

  .workflow-selector__select {
    width: 320px;
  }
}
</style>
