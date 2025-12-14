<template>
  <n-card title="Workflows">
    <template #header-extra>
      <n-button size="small" @click="handleReset">Reset to Default Workflow</n-button>
    </template>
    <n-space vertical :size="24">

      <div class="workflow-selector">
        <n-select v-model:value="selectedWorkflowId" :options="workflowOptions" :loading="workflows$.IsLoadingWorkflows"
          placeholder="Choose a workflow" clearable class="workflow-selector__select" />

        <n-alert type="info" class="text-sm workflow-selector__alert">
          This tool cannot download your custom workflow durations. Please configure the steps and their
          durations manually below.
        </n-alert>
      </div>
      <div class="workflow-selector">


        <!-- <WorkflowStepConfigurator v-for="(step, index) in workflowSteps" :key="step.id" :step="step" :index="index"
          :is-first="index === 0" :is-last="index === workflowSteps.length - 1"
          @remove="confirmRemove(workflowId, step.id, step.name)" @move="moveStep(index, $event)"
          @update="updateStep(step.id, $event)" />


          <n-button type="primary" @click="addStep()">Add Workflow Step</n-button> -->

      </div>


    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';

const router = useRouter();
const workflows$ = useWorkflowsState();

const selectedWorkflowId = ref<string | null>(null);

const workflowOptions = computed(() => {
  if (!workflows$.Workflows) return [];
  return workflows$.Workflows.map((w) => ({
    label: w.Name,
    value: w.Id,
  }));
});

const workflowSteps = ref<WorkflowStep[]>([]);

const STORAGE_KEY = 'workflow-config';

const handleReset = () => {
  // Confirm reset
  // If confirmed, call resetWorkflow
};

const initializeWorkflows = () => {
  // Try to load from localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      console.log('[WorkflowDurationConfig] Loaded from storage');
      return;
    } catch (err) {
      console.warn('[WorkflowDurationConfig] Failed to parse stored data', err);
    }
  }

  // Otherwise initialize new from workflow-state
};


const addStep = (step: WorkflowStep) => {
  // Update workflow-state
  // Update Cache
};

const removeStep = (stepId: string) => {
  // Update workflow-state by removing step with this stepId
  // Update Cache
};

const confirmRemove = (workflowId: string, stepId: string, name: string) => {
  // app$.openModal('confirm', {
  //   title: 'Remove Step?',
  //   message: `Are you sure you want to remove "${name || 'this step'}"?`,
  //   confirmText: 'Remove',
  //   cancelText: 'Cancel',
  //   confirmType: 'error',
  //   onConfirm: () => removeStep(stepId),
  // });
};

const moveStep = (stepIndex: number, direction: 'up' | 'down') => {
  // Update the order of steps in workflow-state
  // Update Cache
};

const handleSave = () => {
  // try {

  // } catch (err) {

  // }
};

const resetWorkflow = (workflowId: string) => {
  // Reset the workflow steps to empty or default
  // Clear Cache
};

onMounted(async () => {
  // If no data in memory, check cache.
  // If no data in cache, use pinia states to call NrgClient to populate data.
  // If no data comes from NrgClient, redirect to data refresh page.
  // AppStatus Error message, "Check your api key or internet connection."

  if (!workflows$.Workflows || workflows$.Workflows.length === 0) {
    await workflows$.LoadWorkflows();
  }

  initializeWorkflows();
});

</script>

<style scoped>
.workflow-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
