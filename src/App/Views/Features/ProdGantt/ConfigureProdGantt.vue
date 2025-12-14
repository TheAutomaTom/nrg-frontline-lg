<template>
  <n-card title="Configuration">


    <n-tabs class="card-tabs" default-value="workflows" size="large" animated pane-wrapper-style="margin: 0 -4px"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;">

      <n-tab-pane name="workflows" tab="Workflows">
        <ConfigTabWorkflows />
      </n-tab-pane>
      <n-tab-pane name="week" tab="Week">
        <ConfigTabWeek />
      </n-tab-pane>
      <n-tab-pane name="labors" tab="Labors">
        <ConfigTabLabors />
      </n-tab-pane>

    </n-tabs>

    <n-space vertical :size="24">





    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import type { WorkflowStep } from '@/Core/Models/ProdGantt/WorkflowStep';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkflowsState } from '@/Data/States/App/ProdGantt/workflows-state';
import ConfigTabWorkflows from './ConfigTabs/ConfigTabWorkflows.vue';
import ConfigTabWeek from './ConfigTabs/ConfigTabWeek.vue';
import ConfigTabLabors from './ConfigTabs/ConfigTabLabors.vue';

const router = useRouter();
const workflows$ = useWorkflowsState();

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

<style scoped></style>
